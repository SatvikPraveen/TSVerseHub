# 0009. The curriculum registry drives the UI

Date: 2026-10-03 · Status: Accepted

## Context

ADR 0003 made the curriculum verifiable: `src/core/curriculum/registry.ts`
declares eight modules, their prerequisite edges, learning objectives,
references and code samples whose compiler expectations are checked on
every build. The pages that learners actually see did not use it. The
Concepts page rendered a hand-written list of twenty-odd "concepts" with
invented learner counts, star ratings, lock states and progress
percentages; the Dashboard rendered a second, unrelated list of "upcoming
concepts". Neither list agreed with the registry's module ids, difficulty
levels or prerequisites, and nothing would have failed if the two drifted
further apart.

The registry already ships the algorithms the UI needs: a topological
order for the study sequence, `learningPath` for the ordered closure of a
target, `criticalPathCost` for cumulative effort and `levels` for depth.

## Decision

The registry is the single source of truth for everything the UI says
about modules, prerequisites and learning paths.

- `src/pages/Concepts.tsx` lists `curriculum.modules` in
  `topologicalOrder(curriculumGraph(curriculum.modules))`. The
  `/concepts/:conceptId` route shows a module's detail when the id is a
  registry `ModuleId`, otherwise the overview with a notice. The detail
  view renders the module's prerequisites as links, objectives with their
  Bloom level, references, and the verified samples with the expectation
  the verifier enforces (`compiles`, `errors: TS2345, TS2344`) and any
  pinned type assertions (`line 1:7 is "dark"`).
- `src/pages/Dashboard.tsx` has a "Learning path" panel driven by
  `learningPath(graph, target)` for a user-selected target (default: the
  deepest module by `levels`), with cumulative minutes from
  `criticalPathCost`, and a prerequisite graph laid out as one column per
  level. "Continue learning" lists the modules whose prerequisites are
  complete.
- Rendering lives in `src/components/curriculum/` (`ModuleOverview`,
  `ModuleDetail`, `SampleCard`, `LearningPath`, `PrerequisiteGraph`).
  These components receive registry types and graph results as props and
  contain no curriculum data of their own.
- UI code imports `core/curriculum/registry`, `graph` and `schema`
  directly, never the `core/curriculum` barrel: `curriculumGraph` lives in
  `verify.ts`, which imports the compiler kernel and with it the whole
  `typescript` package (3.6 MB, which also exceeds the PWA precache limit
  and fails `vite build`). `src/components/curriculum/model.ts` builds the
  same graph from the registry, and a test asserts it equals
  `curriculumGraph(curriculum.modules)`.
- Completion state stays in `ProgressContext`, keyed by registry module
  id, so progress and curriculum share one identifier space.
- Component tests under `tests/components/` assert the rendered order,
  badges and paths against the registry and the graph functions rather
  than against literals copied from the registry, so a curriculum change
  cannot silently break the pages.

Hand-written module metadata (learner counts, ratings, lock overlays,
per-module progress bars, category and tag filters) was removed rather
than ported. Anything the registry does not declare is not shown.

## Consequences

- Adding or re-ordering a module is a registry change; the Concepts page,
  the Dashboard path and the prerequisite graph follow without edits.
- The pages display less than before: no community numbers, ratings or
  tags. These were fabricated, and reintroducing any of them requires a
  field in `ConceptModule` and a decision on how it is verified.
- The graph construction exists twice (verifier and UI model), held
  together by a parity test. Moving `curriculumGraph` into `graph.ts`
  would remove the duplicate; that is a change to `core` and is left for a
  follow-up.
- Code samples are shown in a static `<pre>` block rather than Monaco;
  the Playground remains the place to edit and run them.
- Dashboard completion figures and the streak now come from
  `ProgressContext`. The achievements, recent-activity, project-count and
  community widgets still show mock data outside the registry's remit;
  migrating them is a separate decision about the progress model, not
  about the curriculum.
