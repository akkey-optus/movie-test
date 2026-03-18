# Issues

- 2026-03-18: `.sisyphus/boulder.json` initially lacked `worktree_path`; added current repo path to satisfy session requirements.
- 2026-03-18: Plan contains 13 unchecked boxes total, including 9 implementation tasks and 4 final-wave tasks.
- : create-next-app would not initialize directly in the repo root because .sisyphus/ and test-setting.json already existed, so the scaffold had to be generated in a temporary subfolder and moved into place.
- 2026-03-18: create-next-app would not initialize directly in the repo root because .sisyphus/ and test-setting.json already existed, so the scaffold had to be generated in a temporary subfolder and moved into place.
- 2026-03-18: `test-setting.json` diverges at the result-field level (`representative` vs `representative_works` and `why_like_this`), so validation and normalization had to stay separate to avoid leaking source-specific keys into shared consumers.
- 2026-03-18: Next.js production type-checking was stricter than the editor for dimension-key generics in the scoring engine, so the tally accumulator had to narrow score maps to `Record<string, number>` at mutation sites to keep `npm run build` green.
- 2026-03-18: Local persistence can fail in SSR or blocked-storage contexts, so Task 4 had to keep all `localStorage` access behind guarded adapter methods and expose a `storage-unavailable` route state instead of throwing.
- 2026-03-18: Task 5 initially failed 
> movie-test@0.1.0 build
> next build

�� Next.js 16.1.7 (Turbopack)

  Creating an optimized production build ...
? Compiled successfully in 6.7s
  Running TypeScript ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/4) ...
  Generating static pages using 7 workers (1/4) 
  Generating static pages using 7 workers (2/4) 
  Generating static pages using 7 workers (3/4) 
? Generating static pages using 7 workers (4/4) in 761.8ms
  Finalizing page optimization ...

Route (app)
�� �� /
�� �� /_not-found
�� ? /quiz/[slug]


��  (Static)   prerendered as static content
?  (Dynamic)  server-rendered on demand because the reduced-motion  union spread widened Motion prop types at ; splitting the props removed the build-time incompatibility.
- 2026-03-18: The Task 5 build blocker came from a union object passed into motion props; Next.js production typing rejected the widened transition shape until the motion props were split out explicitly.
- 2026-03-18: Task 6 integration briefly broke the build because `QuizShellProps` added a required `tieBreaker` prop before the route page forwarded `catalog.meta.tieBreaker`.
- 2026-03-18: LSP verification for CSS/JSON initially failed because the configured `biome` server was missing from the environment; installing `@biomejs/biome` globally restored diagnostics for changed project files.
