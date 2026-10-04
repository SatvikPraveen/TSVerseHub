# 0008. The playground runs on the compiler kernel, in a Web Worker

Date: 2026-10-03 · Status: Accepted

## Context

ADR 0004 introduced `src/core/compiler`, a filesystem-free compiler host that
the curriculum verifier and the benchmarks use. The playground did not: its
hook (`usePlaygroundCompiler`) returned regex-based "diagnostics" and a
regex-stripped "transpilation", and Monaco's TypeScript worker produced a
second, differently configured set of squiggles. What a learner saw in the
browser could therefore disagree with what the verifier accepts.

Using the kernel in the browser needs two things it lacked there: the
`lib.*.d.ts` files (3.0 MiB across 99 files in TypeScript 5.9) and somewhere to
run a 3.6 MB compiler without blocking typing.

## Decision

- **Libraries.** `core/compiler/browser-libs.ts` exposes the installed
  `typescript/lib/lib.*.d.ts` through
  `import.meta.glob(..., { query: '?raw', import: 'default' })`. Each file
  becomes its own lazily loaded chunk. `createBrowserLibProvider()` loads the
  root libs for an option set plus everything reachable through
  `/// <reference lib="..." />` (parsed from the text), then returns the
  kernel's synchronous `LibProvider` over a shared static map. It is memoised
  per root set and can `preloadAll`. It has no `node:` imports. It is kept out
  of `core/compiler/index.ts` because `import.meta.glob` needs Vite types and a
  Vite transform, which the Node project (`tsconfig.node.json`, `tsx`
  scripts) does not have.
- **Off the main thread.** `core/compiler/compiler.worker.ts` is a module
  worker. It wraps `kernel-service.ts`, a plain request handler over
  `analyze()`, `typeAt()` and `transpile()` that is unit-tested in Node. The
  protocol (`kernel-protocol.ts`) is types plus two guards, so the page chunk
  never imports the compiler. Lib loading turned out to be no harder in the
  worker: Vite bundles the glob's dynamic imports as worker chunks.
- **Cancellation.** `useCompilerKernel` debounces analysis (300 ms by default).
  Each hook instance analyses on its own channel, with separate `live`
  (debounced) and `now` (on demand) lanes. The worker yields a macrotask
  before checking, so a queued newer request on the same channel answers the
  older one with `cancelled`. The hook also drops responses that are not the
  latest it started. One worker is shared by the whole page.
- **Options.** The EditorConfig presets (`getTypeScriptCompilerOptions`) are
  projected by `toKernelCompilerOptions` into tsconfig JSON. The worker
  converts that JSON with `ts.convertCompilerOptionsFromJson`, and conversion
  errors show up as diagnostics. Layout and emit-only settings (`rootDir`,
  `outDir`, `paths`, …) are dropped. Analysis adds `moduleDetection: "force"`
  so playground globals don't collide with `lib.dom.d.ts`. Transpilation for
  execution does not, so its output stays a plain script.
- **UI.** Kernel diagnostics become Monaco markers through
  `kernelDiagnosticsToMarkers`. Monaco positions are 1-based like the kernel's
  `line`/`column`, so those pass through unchanged. The end position comes
  from the 0-based `start + length` offset in the analysed text. Monaco's own
  TypeScript validation is turned off; its hover and completion stay on. A
  status bar shows the program and check times, the error count, and the type
  at the cursor (`typeAt` on the identifier under the cursor, debounced).
  `compileAndRun` and `transpile` use the kernel's `transpile()`.
- **PWA.** The worker and the lib chunks are left out of the service-worker
  precache (the worker is over Workbox's 2 MiB limit, and the libs are only
  for the playground). They are cached `CacheFirst` on first use instead.

## Consequences

- The playground, the verifier and the benchmarks share one compiler, so they
  report the same diagnostics. A test checks that the browser provider and the
  Node provider give identical diagnostics.
- The initial `main` chunk is unchanged (43.6 kB). The playground route chunk
  grew from 15.7 kB to 35.1 kB (hook, markers, status bar, real editor). The
  compiler arrives as a separate 3.6 MB worker (≈1.0 MB gzip), and only when a
  playground or demo panel mounts.
- The learning preset (ES2020 + DOM) reaches 46 lib files: 2.2 MiB raw, ≈331
  KiB gzip, almost all of it `lib.dom.d.ts`. The kernel's strict default
  reaches 59 files and 2.3 MiB.
- Each analysis and `typeAt` call builds a fresh program and re-parses the
  libs (ADR 0004). That is acceptable at playground sizes. A cached
  lib-`SourceFile` layer or an incremental program would be the next step if
  timings grow.
- Where `Worker` is unavailable (SSR, jsdom), the kernel reports
  `unavailable` and `compileAndRun` returns a failure diagnostic rather than
  crashing.
