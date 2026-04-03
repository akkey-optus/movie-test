# Planet Result Artwork Design

## Goal

Replace the placeholder artwork block in the `planet_test` result screen with the real planet images from `src/assert/plant`, while preserving the existing observatory/HUD result-card layout and keeping the card responsive on mobile and desktop.

## Scope

- Only affects `planet_test` result rendering.
- Only replaces the reserved artwork area inside the existing result card.
- Does not change movie or fairy result cards.
- Does not rename source image files.

## Source Assets

The asset folder already contains 16 PNG files in `src/assert/plant`, matching the 16 planet results:

- `Ceres.png`
- `Earth.png`
- `Enceladus.png`
- `Europa.png`
- `Io.png`
- `Jupiter.png`
- `Mars.png`
- `Mercury.png`
- `Moon.png`
- `Neptune.png`
- `Pluto.png`
- `saturn.png`
- `Sun.png`
- `Titan.png`
- `Uranus.png`
- `Venus.png`

## Mapping Strategy

Use a stable explicit mapping from the Chinese result titles in `test-setting.json` to imported image modules, instead of relying on ad-hoc filename normalization at runtime.

Examples:

- `地球` -> `Earth.png`
- `木卫二` -> `Europa.png`
- `土卫二` -> `Enceladus.png`
- `土星` -> `saturn.png`

This keeps the result rendering deterministic, avoids breakage from filename casing differences, and makes later asset swaps straightforward.

## UI Behavior

The `planet_test` result card keeps the current structure in `src/components/quiz/quiz-result-screen.tsx`, but the placeholder glyph block becomes a real artwork panel.

- The image fills the reserved artwork frame with `object-fit: cover`.
- The artwork remains clipped by the existing rounded container.
- The existing sci-fi overlay layers (`mesh`, `glow`, frame treatment) stay in place so the result still feels like part of the planet theme.
- Overlay copy remains readable by keeping the text in a dedicated content layer above the image.

## Responsive Layout

- Mobile: artwork stays tall enough to feel like a hero visual and should not collapse below the current slot height.
- Desktop: artwork sits in the right-side panel already defined by `.quiz-result-hero-grid`.
- If an image composition feels too low or too high, support a per-result focal-position override through `object-position` rather than changing the layout.

## Accessibility

- Every rendered image must have meaningful `alt` text based on the result title.
- Decorative overlays remain `aria-hidden`.
- No motion changes are required; existing `prefers-reduced-motion` behavior remains intact.

## Testing

- Add a focused test for the title-to-image resolver.
- Verify the result screen renders the real image for a `planet_test` completed attempt.
- Run the relevant unit test target and a production build.

## Notes

- This design document is written as requested, but not committed because you did not ask for a git commit.
