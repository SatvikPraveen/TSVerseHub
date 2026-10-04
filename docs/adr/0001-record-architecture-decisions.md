# 0001. Record architecture decisions

Date: 2026-10-03 · Status: Accepted

## Context

The repository started as a generated scaffold whose README described
infrastructure (CI, Docker, 95% coverage) that did not exist, and whose source
had never been compiled. Rebuilding it into a research-grade artefact
involves many judgement calls that future contributors, reviewers and the
author's future self will want to understand.

## Decision

Record every significant architectural, tooling or policy decision as a
short, numbered Markdown file in `docs/adr/`, using the Nygard template
(Context, Decision, Consequences). A pull request that changes architecture
must add or supersede a record.

## Consequences

- Rationale survives the people and chat logs that produced it.
- Reviewers can challenge the reasoning, not just the diff.
- A small amount of writing overhead per structural change.
