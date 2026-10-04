# 0007. No opaque binary assets: synthesised audio, hosted fonts

Date: 2026-10-03 · Status: Accepted

## Context

The scaffold shipped zero-byte `.woff2`, `.mp3` and `.wav` files and CSS
referencing weights that did not exist, producing build warnings and silent
runtime failures. Binary assets are also unreviewable in pull requests.

## Decision

- Audio feedback is synthesised with the Web Audio API from small declarative
  tone sequences (`src/assets/sounds/index.ts`); it is a no-op where
  `AudioContext` is unavailable.
- Inter, Space Grotesk and JetBrains Mono load from Google Fonts with
  `preconnect`; the CSS files define fallback stacks only.

## Consequences

- The repository contains no media binaries; every asset is diffable.
- Offline use degrades to system fonts; the PWA caches font responses.
