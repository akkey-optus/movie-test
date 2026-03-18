# Planet MBTI Quiz Template

## TL;DR
> **Summary**: Build a mobile-first, pure-frontend MBTI-style entertainment quiz in `Next.js + Tailwind CSS`, driven by `test-setting.json`, with `planet_test` as the first shipped theme. The app stores completion locally, re-enters summary-only on the same device/browser, exports a result image, and uses existing motion libraries for premium interactions.
> **Deliverables**:
> - Reusable 4-dimension / 8-question / 16-result quiz engine
> - `planet_test` production route with animated mobile-first UI
> - Local completion lock, client-side expiry handling, and summary-only revisit
> - Result image export and responsive E2E coverage
> **Effort**: Medium
> **Parallel**: YES - 3 waves
> **Critical Path**: 1 -> 2 -> 3 -> 4 -> 6 -> 7 -> 8 -> 9

## Context
### Original Request
Create a responsive quiz website for phone-first novice users. Users answer questions, get a result, save a result image, and re-enter via the same link into summary-only mode. The user accepted a pure-frontend MVP, wants the product reusable as a template for future quizzes, prefers `React`/`Next.js + Tailwind CSS`, and requires richer interactions such as long-press reveal, animated progress, and patterned animated backgrounds using existing libraries instead of bespoke animation systems.

### Interview Summary
- Workspace is greenfield except `test-setting.json` and planning artifacts.
- The chosen product direction is a pure-frontend H5 MVP with no login, local storage persistence, and no anti-abuse hardening.
- Future quizzes must be added by editing config/JSON, not by rewriting page logic.
- The first shipped quiz is `planet_test`, which uses an MBTI-style 4-axis / 8-question scoring model and returns 16 outcomes.
- Share rules are UX rules only in MVP: same device/browser revisit is supported; true global one-time use and true cross-device continuity are explicitly out of scope.
- Motion should feel premium, with existing libraries handling transitions, progress animation, and reveal interactions.

### Metis Review (gaps addressed)
- Locked MVP scope to `planet_test` while preserving config-driven support for `movie_test` and `xianling_test`.
- Declared same-device/browser-only revisit as the accepted frontend-only constraint.
- Added a normalized config contract plus adapter for theme-specific result fields because `planet_test`, `movie_test`, and `xianling_test` do not share an identical result payload.
- Standardized on `npm`, `Vitest`, `Playwright`, `motion/react`, and a small existing long-press hook library instead of hand-rolled animation primitives.
- Added explicit QA for tie-breaks, expired links, corrupted storage, PNG export, and mobile/desktop responsive states.

## Work Objectives
### Core Objective
Ship one production-ready `planet_test` experience from `test-setting.json` using a reusable MBTI quiz engine and animated mobile-first UI, while keeping the codebase ready for additional config-driven tests later without changing route logic.

### Deliverables
- `Next.js` App Router scaffold with `Tailwind CSS`, `TypeScript`, `Vitest`, and `Playwright`
- Config schema validator and adapter layer for `test-setting.json`
- MBTI scoring engine honoring tie-breaker `I/N/F/P`
- Client persistence contract keyed by `slug + token`
- Animated quiz flow, progress bar, background pattern motion, and long-press result reveal
- Result summary page, summary-only revisit behavior, expired-link state, and image export
- Unit tests, mobile E2E tests, desktop E2E tests, and build verification

### Definition of Done (verifiable conditions with commands)
- `npm run test:unit` exits `0`
- `npm run test:e2e -- --project="Mobile Chrome"` exits `0`
- `npm run test:e2e -- --project="Desktop Chrome"` exits `0`
- `npm run build` exits `0`
- Visiting `/quiz/planet_test?token=demo&expireAt=4102444800000` supports one complete run, exports a PNG, and reloads into summary-only mode on the same browser

### Must Have
- App Router route shape fixed as `/quiz/[slug]` with `token` and `expireAt` search params
- `planet_test` as the first shipped theme with no custom route logic outside config-driven rendering
- Reusable engine limited to MBTI-style quizzes: 4 dimensions, 8 questions, 16 results
- `motion/react` for transitions, progress, and animated background layers
- Existing long-press hook library for the hold-to-reveal interaction
- Local persistence with graceful recovery from malformed or unavailable storage
- Mobile-first experience with desktop compatibility and no horizontal overflow

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No backend, auth, analytics, CMS, admin panel, social preview service, or true cross-device sync
- No promise of globally enforced single-use links; all locking/expiry is client UX only
- No generic survey-builder scope expansion beyond the MBTI-style schema already present in `test-setting.json`
- No hand-rolled animation engine, physics engine, or bespoke gesture library
- No per-theme page forks for `movie_test` and `xianling_test` in MVP

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: `tests-after` with mandatory logic-first coverage before UI merge; framework split is `Vitest` for config/scoring/storage and `Playwright` for route/UI/export/response states
- QA policy: Every task includes agent-executed happy-path and failure/edge scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. Shared foundations are extracted into Wave 1 for maximum parallelism.

Wave 1: foundation and contracts
- Task 1 - project scaffold and test baseline
- Task 2 - config schema, adapter, and catalog contract
- Task 3 - MBTI scoring engine and tie-break tests
- Task 4 - persistence and route state contract

Wave 2: product UI and interactions
- Task 5 - application shell, animated background system, and route states
- Task 6 - quiz flow UI, question transitions, and animated progress system
- Task 7 - result reveal, summary-only revisit UX, and premium motion behaviors
- Task 8 - image export and mobile share affordances

Wave 3: integration hardening
- Task 9 - route wiring, config reuse proof, responsive QA, and end-to-end automation

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | - | 2, 3, 4, 5, 9 |
| 2 | 1 | 5, 6, 7, 9 |
| 3 | 1, 2 | 6, 7, 9 |
| 4 | 1, 2, 3 | 5, 6, 7, 8, 9 |
| 5 | 1, 2, 4 | 6, 7, 8, 9 |
| 6 | 2, 3, 4, 5 | 7, 8, 9 |
| 7 | 3, 4, 5, 6 | 8, 9 |
| 8 | 5, 6, 7 | 9 |
| 9 | 1, 2, 3, 4, 5, 6, 7, 8 | F1, F2, F3, F4 |

### Agent Dispatch Summary (wave -> task count -> categories)
- Wave 1 -> 4 tasks -> `quick`, `unspecified-high`
- Wave 2 -> 4 tasks -> `visual-engineering`, `unspecified-high`
- Wave 3 -> 1 task -> `unspecified-high`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Scaffold the Next.js quiz app and testing baseline

  **What to do**: Initialize a `Next.js` App Router app with `TypeScript`, `Tailwind CSS`, `npm`, `Vitest`, and `Playwright`. Define the first-pass folder structure for quiz engine logic, config loading, UI components, and end-to-end tests. Add package scripts exactly as `test:unit`, `test:e2e`, and `build` so later tasks have stable automation entry points.
  **Must NOT do**: Do not add backend services, auth scaffolding, analytics, or any theme-specific page duplication.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: greenfield scaffold with deterministic setup steps
  - Skills: `[]` - no extra skill required beyond standard project setup
  - Omitted: `frontend-ui-ux` - not needed until UI direction lands in later tasks

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 5, 9 | Blocked By: -

  **References**:
  - Pattern: `test-setting.json:1` - preserve this file as the single source of quiz content during MVP
  - External: `https://nextjs.org/docs/app` - App Router structure and client/server boundaries
  - External: `https://tailwindcss.com/docs/installation/framework-guides/nextjs` - Tailwind setup for Next.js
  - External: `https://vitest.dev/guide/` - unit test runner setup
  - External: `https://playwright.dev/docs/intro` - E2E automation and download assertions

  **Acceptance Criteria**:
  - [ ] `npm run build` exits `0`
  - [ ] `npm run test:unit` exits `0` with at least one scaffold sanity spec
  - [ ] `npm run test:e2e -- --list` exits `0`
  - [ ] The repo contains a stable route foundation for `/quiz/[slug]`

  **QA Scenarios**:
  ```text
  Scenario: Tooling baseline is executable
    Tool: Bash
    Steps: Run `npm install`; run `npm run test:unit`; run `npm run test:e2e -- --list`; run `npm run build`
    Expected: All commands exit 0 and no missing-script errors occur
    Evidence: .sisyphus/evidence/task-1-scaffold.txt

  Scenario: Route foundation exists
    Tool: Bash
    Steps: Run `npm run dev`; request `/quiz/planet_test` with Playwright or dev server check
    Expected: Route resolves without framework 404 caused by missing dynamic route setup
    Evidence: .sisyphus/evidence/task-1-route-foundation.txt
  ```

  **Commit**: YES | Message: `chore(app): scaffold next quiz app and testing baseline` | Files: `package.json`, `app/`, `src/`, `tests/`

- [x] 2. Define the config schema, adapters, and quiz catalog contract

  **What to do**: Create runtime validation for `test-setting.json` and normalize it into a reusable internal contract. Support the existing MBTI meta block, the `tests` array, 8-question quiz structure, 16 results, and theme-specific optional result fields such as `representative`, `representative_works`, and `why_like_this` via an adapter layer instead of route forks.
  **Must NOT do**: Do not redesign the authoring format, do not require manual code edits for each result field in page components, and do not generalize beyond the current 4-axis MBTI-style shape.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: schema design and adapter contract affect the full codebase
  - Skills: `[]` - direct coding is sufficient
  - Omitted: `frontend-ui-ux` - visual work is not the concern here

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5, 6, 7, 9 | Blocked By: 1

  **References**:
  - Pattern: `test-setting.json:2` - top-level meta contract
  - Pattern: `test-setting.json:24` - fixed `result_count` of 16
  - Pattern: `test-setting.json:25` - tie-breaker source of truth
  - Pattern: `test-setting.json:134` - quiz catalog root
  - Pattern: `test-setting.json:315` - `planet_test` result optional field pattern
  - Pattern: `test-setting.json:607` - `movie_test` result field divergence
  - Pattern: `test-setting.json:914` - `xianling_test` result field divergence

  **Acceptance Criteria**:
  - [ ] `npm run test:unit -- config` exits `0`
  - [ ] Loading `planet_test`, `movie_test`, and `xianling_test` produces one normalized internal shape
  - [ ] Invalid config with duplicate question IDs or missing result records fails validation deterministically
  - [ ] The adapter contract exposes a core result payload usable by one shared result page

  **QA Scenarios**:
  ```text
  Scenario: All configured quizzes validate and normalize
    Tool: Bash
    Steps: Run `npm run test:unit -- config`; include fixtures for `planet_test`, `movie_test`, and `xianling_test`
    Expected: All three quizzes load into one normalized internal contract without page-specific branching
    Evidence: .sisyphus/evidence/task-2-config-validation.txt

  Scenario: Broken config is rejected safely
    Tool: Bash
    Steps: Run a unit test fixture with a duplicated `Q1` id and a missing `INTJ` result record
    Expected: Validation fails with explicit errors and no silent fallback occurs
    Evidence: .sisyphus/evidence/task-2-config-errors.txt
  ```

  **Commit**: YES | Message: `test(config): add mbti schema and adapter coverage` | Files: `src/config/`, `src/lib/config/`, `src/lib/config/__tests__/`

- [x] 3. Build the MBTI scoring engine with exact tie-break behavior

  **What to do**: Implement pure scoring logic that aggregates option scores across the four MBTI dimensions, resolves each pair by highest score, and applies the configured tie-breaker `I/N/F/P` when dimension scores are equal. Expose a deterministic function that returns both the MBTI code and the mapped result payload for a given quiz.
  **Must NOT do**: Do not embed scoring logic in React components, and do not hard-code planet-specific results directly into the engine.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: central business logic with exact correctness requirements
  - Skills: `[]` - targeted engine implementation only
  - Omitted: `frontend-ui-ux` - logic-only task

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6, 7, 9 | Blocked By: 1, 2

  **References**:
  - Pattern: `test-setting.json:6` - MBTI dimension pairs and ordering
  - Pattern: `test-setting.json:25` - tie-breaker preference `I/N/F/P`
  - Pattern: `test-setting.json:27` - dimension/question mapping
  - Pattern: `test-setting.json:312` - `planet_test` result lookup table

  **Acceptance Criteria**:
  - [ ] `npm run test:unit -- scoring` exits `0`
  - [ ] All `A` answers for `planet_test` resolve to `ESTJ` with title `地球`
  - [ ] All `B` answers for `planet_test` resolve to `INFP` with title `木卫二`
  - [ ] Answer sequence `Q1A Q2A Q3A Q4A Q5B Q6B Q7B Q8B` resolves to `INFP`

  **QA Scenarios**:
  ```text
  Scenario: Happy-path scoring returns deterministic types
    Tool: Bash
    Steps: Run `npm run test:unit -- scoring` with fixtures for all-A and all-B answer sets on `planet_test`
    Expected: All-A returns `ESTJ` / `地球`; all-B returns `INFP` / `木卫二`
    Evidence: .sisyphus/evidence/task-3-scoring-happy.txt

  Scenario: Tie-break path resolves correctly
    Tool: Bash
    Steps: Run a scoring unit test with answers `Q1A Q2A Q3A Q4A Q5B Q6B Q7B Q8B`
    Expected: E/I, S/N, T/F, J/P each tie and final type resolves to `INFP` by configured tie-break order
    Evidence: .sisyphus/evidence/task-3-scoring-tie.txt
  ```

  **Commit**: YES | Message: `feat(engine): add mbti scoring and tie-break logic` | Files: `src/lib/quiz-engine/`, `src/lib/quiz-engine/__tests__/`

- [x] 4. Define persistence, expiry, and revisit state contracts

  **What to do**: Implement a client persistence adapter using `localStorage` with a versioned key format `quiz-attempt:v1:${slug}:${token || "default"}`. Persist partial progress after each answer and restore the latest unfinished step on reload when the link is still valid. Define and test the canonical rules: first visit can answer if not expired; completed attempts on the same browser re-enter summary-only; expired links block new attempts; if the same browser already has a saved completion and the link is now expired, show the saved summary instead of a hard block; malformed storage resets safely.
  **Must NOT do**: Do not use IndexedDB for MVP, do not promise cross-device restore, and do not store full rendered images in storage.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: route state and persistence behavior affect all UX branches
  - Skills: `[]` - focused state and storage work only
  - Omitted: `frontend-ui-ux` - behavior contract comes before visuals

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6, 7, 8, 9 | Blocked By: 1, 2, 3

  **References**:
  - Pattern: `test-setting.json:34` - entertainment-only disclaimer should align with client-side rule wording
  - Pattern: `test-setting.json:136` - `planet_test` slug source
  - External: `https://developer.mozilla.org/docs/Web/API/Window/localStorage` - browser storage behavior and limitations

  **Acceptance Criteria**:
  - [ ] `npm run test:unit -- storage` exits `0`
  - [ ] Completing `planet_test` at `token=demo` writes a versioned key using `slug + token`
  - [ ] Reloading an unfinished valid attempt resumes at the last answered step on the same browser
  - [ ] Reloading the same URL after completion enters summary-only state without re-answering
  - [ ] Corrupted JSON in the storage key does not crash the app and falls back to a safe recoverable state

  **QA Scenarios**:
  ```text
  Scenario: Same-browser progress and revisit restore correctly
    Tool: Bash
    Steps: Run `npm run test:unit -- storage` with one fixture storing 3 completed answers for `token=demo` and another storing a completed `planet_test` attempt for `token=done-demo`
    Expected: The route-state helper resumes step 4 for `demo` and returns `summary` for `done-demo`
    Evidence: .sisyphus/evidence/task-4-storage-summary.txt

  Scenario: Expired and corrupted state are handled safely
    Tool: Bash
    Steps: Run storage unit tests with `expireAt=1` and with malformed JSON under `quiz-attempt:v1:planet_test:demo`
    Expected: Expired incomplete attempts map to `expired`; malformed data resets to safe intro state with no thrown uncaught error
    Evidence: .sisyphus/evidence/task-4-storage-errors.txt
  ```

  **Commit**: YES | Message: `feat(state): add local attempt and expiry contract` | Files: `src/lib/storage/`, `src/lib/state/`, `src/lib/storage/__tests__/`

- [x] 5. Build the application shell, animated background system, and route-state views

  **What to do**: Create the shared page shell for `/quiz/[slug]`, including intro, expired, unknown-slug, storage-unavailable, and summary container states. Use `motion/react` to deliver low-cost premium motion with exactly three decorative layers: a slow orbit-ring layer, a drifting star/pattern dot layer, and a blurred glow layer. Keep animation limited to opacity and transform, add reduced-motion handling, and keep the page mobile-first.
  **Must NOT do**: Do not create theme-specific page forks, do not use large video backgrounds, and do not animate layout on every render in a way that harms mobile performance.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: shell and background motion establish the whole product feel
  - Skills: [`frontend-ui-ux`] - needed to keep the interface polished rather than generic
  - Omitted: [`playwright`] - not required until E2E validation tasks

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6, 7, 8, 9 | Blocked By: 1, 2, 4

  **References**:
  - Pattern: `test-setting.json:138` - page title source for `planet_test`
  - Pattern: `test-setting.json:139` - subtitle source for intro state
  - Pattern: `test-setting.json:140` - intro copy source
  - Pattern: `test-setting.json:34` - disclaimer copy for entertainment framing
  - External: `https://motion.dev/docs/react` - Motion components, layout animation, and reduced-motion patterns

  **Acceptance Criteria**:
  - [ ] `npm run build` exits `0`
  - [ ] `/quiz/planet_test`, `/quiz/unknown_slug`, and `/quiz/planet_test?token=expired-demo&expireAt=1` each render a distinct state with no runtime error
  - [ ] Background motion is present but does not introduce horizontal overflow at mobile width `390`
  - [ ] Reduced-motion mode disables non-essential looping animation

  **QA Scenarios**:
  ```text
  Scenario: Core route states render correctly
    Tool: Playwright
    Steps: Open `/quiz/planet_test`; open `/quiz/unknown_slug`; open `/quiz/planet_test?token=expired-demo&expireAt=1`
    Expected: Intro, unknown-slug, and expired views each show distinct headings/CTAs and no white-screen crash
    Evidence: .sisyphus/evidence/task-5-route-states.png

  Scenario: Background motion stays responsive
    Tool: Playwright
    Steps: Open `/quiz/planet_test` at `390x844` and `1280x800`; capture screenshots and evaluate document overflow width
    Expected: No horizontal scrollbar, primary CTA remains visible, and animated background remains behind content
    Evidence: .sisyphus/evidence/task-5-background-responsive.png
  ```

  **Commit**: YES | Message: `feat(shell): add animated quiz shell and route states` | Files: `app/quiz/[slug]/`, `src/components/shell/`, `src/components/background/`

- [x] 6. Implement the quiz flow UI, animated progress bar, and answer transitions

  **What to do**: Build the 8-question answer flow for `planet_test` with one active question at a time, animated card transitions, visible answer selection, and a dynamic progress bar driven by question index. Use `motion/react` for enter/exit transitions, progress interpolation, and tactile button feedback. Keep all content sourced from config and use the scoring/state contracts from earlier tasks. Restore unfinished attempts to the exact next question index after reload.
  **Must NOT do**: Do not pre-render all questions at once, do not hard-code question copy into components, and do not hide progress or answer state behind hover-only affordances.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: this task combines interaction design with accurate config rendering
  - Skills: [`frontend-ui-ux`] - needed for polished mobile-first question flow
  - Omitted: [`playwright`] - task implementation first; E2E lands later

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7, 8, 9 | Blocked By: 2, 3, 4, 5

  **References**:
  - Pattern: `test-setting.json:141` - `planet_test` question collection root
  - Pattern: `test-setting.json:144` - first question copy shape
  - Pattern: `test-setting.json:149` - option text and score shape
  - External: `https://motion.dev/docs/react` - `AnimatePresence`, springs, and progress animation patterns

  **Acceptance Criteria**:
  - [ ] `planet_test` renders exactly 8 steps sourced from config
  - [ ] The progress bar advances from `1/8` to `8/8` with animated width/scale updates
  - [ ] Selecting answers in sequence completes without losing state on the same page session
  - [ ] `npm run build` and relevant unit/component tests exit `0`

  **QA Scenarios**:
  ```text
  Scenario: Happy-path question flow completes
    Tool: Playwright
    Steps: Open `/quiz/planet_test?token=demo&expireAt=4102444800000`; click answer `A` on all 8 questions in order
    Expected: Question index increments from 1 to 8, progress bar reaches full state, and the flow reaches the reveal gate without missing-copy errors
    Evidence: .sisyphus/evidence/task-6-quiz-flow.png

  Scenario: Progress and answer state remain stable on mobile
    Tool: Playwright
    Steps: Open `/quiz/planet_test?token=resume-demo&expireAt=4102444800000` at `390x844`; answer first 3 questions; reload the page
    Expected: No layout jump causing clipped CTAs, progress text resumes at step 4, and selected answer history remains intact
    Evidence: .sisyphus/evidence/task-6-progress-mobile.png
  ```

  **Commit**: YES | Message: `feat(flow): build animated question flow and progress UI` | Files: `src/components/quiz/`, `src/features/planet-test/`, `src/hooks/`

- [x] 7. Add the long-press result reveal, summary-only revisit, and premium result motion

  **What to do**: After question 8, gate result disclosure behind a long-press interaction instead of an immediate tap. Use `react-use` `useLongPress` with a fixed `900ms` hold threshold for the gesture, and use `motion/react` for the hold ring/progress, reveal transition, and result-card entry choreography. When the attempt is already complete in local storage, skip the hold gate and enter the summary-only result screen directly.
  **Must NOT do**: Do not hand-roll custom pointer timing logic if a library hook can handle it, do not require hover interactions, and do not force users to long-press again on revisit.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: motion, gesture UX, and revisit behavior all meet here
  - Skills: [`frontend-ui-ux`] - needed for polished reveal choreography and novice-friendly affordances
  - Omitted: [`playwright`] - still implementation-focused; task 9 handles final E2E

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8, 9 | Blocked By: 3, 4, 5, 6

  **References**:
  - Pattern: `test-setting.json:138` - result theming stays aligned to `planet_test`
  - Pattern: `test-setting.json:314` - result description content used on reveal card
  - Pattern: `test-setting.json:315` - keyword presentation source
  - Pattern: `test-setting.json:317` - result closing line source
  - External: `https://motion.dev/docs/react` - reveal transitions and gesture feedback animation
  - External: `https://github.com/streamich/react-use` - existing `useLongPress` hook source and usage pattern

  **Acceptance Criteria**:
  - [ ] A simple tap on the reveal CTA does not open the result
  - [ ] Holding the reveal CTA for `900ms` opens the result with animated feedback
  - [ ] Revisiting a completed attempt bypasses the question flow and bypasses the hold gate
  - [ ] The result screen shows MBTI code, title, description, keywords, and closing copy from config

  **QA Scenarios**:
  ```text
  Scenario: Long-press reveal works on a fresh completion
    Tool: Playwright
    Steps: Open `/quiz/planet_test?token=reveal-demo&expireAt=4102444800000`; answer all 8 questions with `A`; tap the reveal CTA once; then long-press it for `900ms`
    Expected: Single tap only shows the hold hint; long-press fills the hold indicator and reveals `ESTJ` / `地球`
    Evidence: .sisyphus/evidence/task-7-long-press.png

  Scenario: Revisit bypasses the hold gate
    Tool: Playwright
    Steps: Complete `/quiz/planet_test?token=revisit-demo&expireAt=4102444800000`; reload the same URL
    Expected: The app lands directly on the summary-only result screen without showing question 1 or the hold-to-reveal gate
    Evidence: .sisyphus/evidence/task-7-summary-revisit.png
  ```

  **Commit**: YES | Message: `feat(result): add hold-to-reveal and summary revisit states` | Files: `src/components/result/`, `src/components/reveal/`, `src/lib/state/`

- [ ] 8. Implement PNG export and mobile share affordances

  **What to do**: Build a dedicated result card/export surface at a fixed `1080x1920` portrait canvas target so the export stays consistent for mobile sharing. Design the export surface on a `360x640` preview frame and scale it by `3x` for export output. Reserve roughly top `15%` for MBTI code/title, middle `55%` for the hero card and description, and bottom `30%` for closing copy and disclaimer. Keep a minimum `72px` safe padding on all sides. Use a client-side export library or DOM-to-image utility to generate a PNG from same-origin assets only. Add mobile-friendly save/share affordances while keeping export deterministic from result data rather than relying on arbitrary full-page screenshots.
  **Must NOT do**: Do not attempt server-generated OG images, do not include cross-origin assets that can taint canvas export, and do not store exported blobs in local storage.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: export layout must remain beautiful and stable across devices
  - Skills: [`frontend-ui-ux`] - needed to keep the share card deliberate and polished
  - Omitted: [`playwright`] - final automated file-download verification belongs in task 9

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9 | Blocked By: 5, 6, 7

  **References**:
  - Pattern: `test-setting.json:314` - result description for export body
  - Pattern: `test-setting.json:315` - keyword chip content
  - Pattern: `test-setting.json:316` - representative imagery/text source for the share card
  - Pattern: `test-setting.json:317` - closing line on export card
  - External: `https://www.npmjs.com/package/html-to-image` - client-side PNG export approach

  **Acceptance Criteria**:
  - [ ] Clicking the export control from a completed result starts a `.png` download
  - [ ] Exported PNG size is greater than `0` bytes
  - [ ] Export works from both a fresh reveal and a summary-only revisit state
  - [ ] The export card uses config-driven content and same-origin visual assets only
  - [ ] The exported image is exactly `1080x1920` and preserves safe margins with no clipped text

  **QA Scenarios**:
  ```text
  Scenario: PNG export works after fresh reveal
    Tool: Playwright
    Steps: Complete `/quiz/planet_test?token=export-demo&expireAt=4102444800000`; long-press reveal; click `[data-testid="export-image-button"]`; wait for download
    Expected: A `.png` download starts, the file size is greater than 0 bytes, and the image dimensions are `1080x1920`
    Evidence: .sisyphus/evidence/task-8-export-fresh.txt

  Scenario: PNG export works from summary-only revisit
    Tool: Playwright
    Steps: Reload `/quiz/planet_test?token=export-demo&expireAt=4102444800000`; click `[data-testid="export-image-button"]`; wait for download
    Expected: Export still succeeds from summary-only mode without requiring a new reveal
    Evidence: .sisyphus/evidence/task-8-export-revisit.txt
  ```

  **Commit**: YES | Message: `feat(export): add result image export and share affordances` | Files: `src/components/export/`, `src/lib/export/`, `src/components/result/`

- [ ] 9. Wire the route end-to-end, prove config reuse, and lock responsive QA

  **What to do**: Integrate all prior modules into the production route, then add end-to-end coverage for mobile and desktop. Prove the engine is reusable by loading quiz metadata for `movie_test` and `xianling_test` through the same loader/catalog path, without enabling separate production page forks in MVP. Finalize selectors, evidence paths, screenshots, and build gates.
  **Must NOT do**: Do not expand the UI to fully ship `movie_test` or `xianling_test`, and do not leave placeholder selectors or vague manual QA notes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: integration, automation, and route hardening cut across the full stack of this MVP
  - Skills: [`playwright`] - required for browser verification and evidence capture
  - Omitted: [`frontend-ui-ux`] - styling decisions should already be finished by this stage

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: F1, F2, F3, F4 | Blocked By: 1, 2, 3, 4, 5, 6, 7, 8

  **References**:
  - Pattern: `test-setting.json:427` - `movie_test` catalog entry proving reusable loader support
  - Pattern: `test-setting.json:734` - `xianling_test` catalog entry proving reusable loader support
  - Pattern: `test-setting.json:397` - `ESTJ` / `地球` result title for positive E2E assertion
  - Pattern: `test-setting.json:355` - `INFP` / `木卫二` result title for tie-break E2E assertion
  - External: `https://playwright.dev/docs/test-assertions` - download, screenshot, and responsive assertions

  **Acceptance Criteria**:
  - [ ] `npm run test:e2e -- --project="Mobile Chrome"` exits `0`
  - [ ] `npm run test:e2e -- --project="Desktop Chrome"` exits `0`
  - [ ] `npm run build` exits `0`
  - [ ] Mobile E2E verifies happy path, tie-break path, expired path, summary-only revisit, and PNG export
  - [ ] Desktop E2E verifies layout stability and visibility of core controls

  **QA Scenarios**:
  ```text
  Scenario: Mobile happy path, tie-break, expiry, and export all pass
    Tool: Playwright
    Steps: Run `npm run test:e2e -- --project="Mobile Chrome"`; include flows for `/quiz/planet_test?token=demo&expireAt=4102444800000`, `/quiz/planet_test?token=tie-demo&expireAt=4102444800000`, and `/quiz/planet_test?token=expired-demo&expireAt=1`
    Expected: Happy path reveals `ESTJ` / `地球`; tie path reveals `INFP` / `木卫二`; expired path blocks questions; export downloads PNG; revisit shows summary-only
    Evidence: .sisyphus/evidence/task-9-mobile-e2e.txt

  Scenario: Desktop responsive stability passes
    Tool: Playwright
    Steps: Run `npm run test:e2e -- --project="Desktop Chrome"`; capture completed-result screenshots at desktop width and assert key CTAs are visible
    Expected: No horizontal overflow, background remains decorative, and export/share controls remain accessible above the fold
    Evidence: .sisyphus/evidence/task-9-desktop-e2e.txt
  ```

  **Commit**: YES | Message: `test(app): add responsive integration and end-to-end coverage` | Files: `tests/e2e/`, `playwright.config.*`, `app/quiz/[slug]/page.*`

## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [ ] F1. Plan Compliance Audit - oracle
- [ ] F2. Code Quality Review - unspecified-high
- [ ] F3. Real Manual QA - unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check - deep

## Commit Strategy
- Use `npm` as the package manager and keep every commit buildable and testable.
- Target commit sequence:
  - `chore: scaffold next quiz app and testing baseline`
  - `test: add mbti schema and scoring coverage`
  - `feat: add config loader and local attempt contract`
  - `feat: build animated quiz flow for planet test`
  - `feat: add result reveal, summary revisit, and export`
  - `test: add responsive end-to-end coverage`

## Success Criteria
- `planet_test` ships as a polished, mobile-first quiz flow backed by config data from `test-setting.json`
- A second quiz can be added later by extending config/adapters, not by duplicating route logic
- The app computes MBTI results correctly, including tie-break cases
- The same browser revisits into summary-only mode without re-answering
- Expired links block new attempts but do not crash the app
- Result image export works on the client and passes automated verification on mobile and desktop
