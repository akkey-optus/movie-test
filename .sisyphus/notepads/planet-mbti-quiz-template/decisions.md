# Decisions

- 2026-03-18: Use `C:\Programming\movie-test` as the registered worktree path for this session.
- 2026-03-18: Use `Next.js + Tailwind CSS + TypeScript + npm` as the base stack.
- 2026-03-18: Use `motion/react` for animation and an existing long-press hook library for hold-to-reveal behavior.
- 2026-03-18: Result export target is fixed at `1080x1920` with a `360x640` preview scaled by `3x`.
- : Keep Task 1 scripts limited to test:unit, test:e2e, and build; Playwright starts Next via npx in webServer instead of relying on a dev script.
- 2026-03-18: Keep Task 1 scripts limited to test:unit, test:e2e, and build; Playwright starts Next via npx next dev in webServer instead of relying on a dev script.
- 2026-03-18: Keep config validation dependency-free for Task 2; use a custom runtime validator plus a slug-based adapter layer rather than adding Zod for a single source file.
- 2026-03-18: Expose scoring through a pure `scoreQuizDefinition(quiz, answers, tieBreaker?)` API that returns answer tallies, the resolved MBTI code, and the normalized result payload without coupling the engine to React or storage state.
- 2026-03-18: Store completion summaries with the normalized MBTI result payload so expired completed links can still resolve to summary-only state without recomputing from UI flow state.
- 2026-03-18: Keep the Task 5 shell intact and fix the Motion typing issue by using explicitly separated section animation props rather than rewriting the shell or removing motion.
- 2026-03-18: Preserve the existing Task 5 shell and resolve the build error with a minimal Motion prop-typing fix instead of redesigning the state views or removing animation.
- 2026-03-18: Keep Task 6 scoring config-driven at the route boundary by forwarding `catalog.meta.tieBreaker` into `QuizShell` rather than hard-coding or depending on an implicit engine fallback.
- 2026-03-18: Implement Task 7 with a dedicated `QuizResultScreen` component that renders a `react-use` long-press gate for fresh completions and the full summary card immediately for revisit-driven `summary` route states.
- 2026-03-18: Keep the hold threshold fixed at exactly `900ms` and drive the ring/progress plus reveal/result-card choreography with `motion/react` instead of custom timing logic.
