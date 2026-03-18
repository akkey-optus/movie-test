# Learnings

- 2026-03-18: Workspace starts greenfield; only `test-setting.json`, `.sisyphus/boulder.json`, and `.sisyphus/plans/planet-mbti-quiz-template.md` exist.
- 2026-03-18: MVP is pure frontend, mobile-first, same-device/browser persistence only; no backend or cross-device guarantees.
- 2026-03-18: `planet_test` is the first shipped quiz; future quizzes reuse the same engine through config/adapters.
- : Task 1 scaffold uses a minimal App Router route at app/quiz/[slug]/page.tsx plus src/lib/quiz-route.ts so later tasks can extend route behavior without changing the URL contract.
- 2026-03-18: Task 1 scaffold uses a minimal App Router route at app/quiz/[slug]/page.tsx plus src/lib/quiz-route.ts so later tasks can extend route behavior without changing the URL contract.
- 2026-03-18: Task 2 validates `test-setting.json` at runtime before normalization, then adapts theme-specific result extras into one shared `extras` object shape so `planet_test`, `movie_test`, and `xianling_test` can share downstream rendering contracts.
- 2026-03-18: Task 3 scoring stays quiz-agnostic by consuming the normalized `QuizDefinition` contract, tallying scores per configured dimension, and resolving final types from shared MBTI dimension order.
- 2026-03-18: Task 4 persists same-browser attempts under `quiz-attempt:v1:${slug}:${token || "default"}` and resumes from the first unanswered question by sanitizing stored answers against quiz order.
- 2026-03-18: Motion's  props were safer for Next build when reduced-motion and standard animation values were passed as separate /// props instead of a spread union object.
- 2026-03-18: For Motion React in this shell, separate reduced-motion section props into explicit initial, animate, exit, and transition values to keep Next.js production type-checking stable.
- 2026-03-18: After Task 6 made `QuizShell` require `tieBreaker`, the route integration stays aligned by passing `catalog.meta.tieBreaker` from `app/quiz/[slug]/page.tsx` instead of relying on the scoring default deeper in the tree.
- 2026-03-18: `react-use` `useLongPress` works cleanly for the 900ms reveal gate when the hook owns the timeout and the component only layers press-start and press-release state around it for motion feedback.
- 2026-03-18: Keeping the fresh-completion reveal state local to `QuizShell` lets stored `summary` route states bypass the hold gate on revisit without changing the storage contract from Task 4.
