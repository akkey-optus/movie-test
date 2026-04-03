# Planet Result Artwork Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder artwork slot on `planet_test` results with the matching real planet image from `src/assert/plant` while preserving the existing sci-fi result-card layout.

**Architecture:** Add a small, explicit title-to-asset resolver for planet results, then update the shared result screen to render a real image only when the current attempt belongs to `planet_test`. Keep the existing card structure and theme overlays, and adjust CSS only where the real image needs layering and responsive sizing.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS in `app/globals.css`, Vitest, existing quiz config in `test-setting.json`

---

### Task 1: Add a failing resolver test for planet artwork

**Files:**
- Create: `src/components/quiz/planet-result-artwork.test.ts`
- Reference: `test-setting.json`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { getPlanetResultArtwork } from "@/src/components/quiz/planet-result-artwork";

describe("getPlanetResultArtwork", () => {
  it("returns the matching artwork metadata for known planet titles", () => {
    expect(getPlanetResultArtwork("地球")?.alt).toContain("地球");
    expect(getPlanetResultArtwork("木卫二")?.alt).toContain("木卫二");
    expect(getPlanetResultArtwork("土星")?.src).toContain("saturn");
  });

  it("returns null for unknown titles", () => {
    expect(getPlanetResultArtwork("不存在的星球")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/components/quiz/planet-result-artwork.test.ts`
Expected: FAIL because `@/src/components/quiz/planet-result-artwork` does not exist yet

### Task 2: Implement the resolver with explicit title-to-file mapping

**Files:**
- Create: `src/components/quiz/planet-result-artwork.ts`
- Reference: `src/assert/plant/*`

- [ ] **Step 1: Write minimal implementation**

```ts
import CeresImage from "@/src/assert/plant/Ceres.png";
import EarthImage from "@/src/assert/plant/Earth.png";
import EnceladusImage from "@/src/assert/plant/Enceladus.png";
import EuropaImage from "@/src/assert/plant/Europa.png";
import IoImage from "@/src/assert/plant/Io.png";
import JupiterImage from "@/src/assert/plant/Jupiter.png";
import MarsImage from "@/src/assert/plant/Mars.png";
import MercuryImage from "@/src/assert/plant/Mercury.png";
import MoonImage from "@/src/assert/plant/Moon.png";
import NeptuneImage from "@/src/assert/plant/Neptune.png";
import PlutoImage from "@/src/assert/plant/Pluto.png";
import SaturnImage from "@/src/assert/plant/saturn.png";
import SunImage from "@/src/assert/plant/Sun.png";
import TitanImage from "@/src/assert/plant/Titan.png";
import UranusImage from "@/src/assert/plant/Uranus.png";
import VenusImage from "@/src/assert/plant/Venus.png";

type PlanetArtwork = {
  src: string;
  alt: string;
  objectPosition?: string;
};

const PLANET_RESULT_ARTWORK: Record<string, PlanetArtwork> = {
  地球: { src: EarthImage.src, alt: "地球结果配图" },
  月球: { src: MoonImage.src, alt: "月球结果配图" },
  海王星: { src: NeptuneImage.src, alt: "海王星结果配图" },
  冥王星: { src: PlutoImage.src, alt: "冥王星结果配图" },
  火星: { src: MarsImage.src, alt: "火星结果配图" },
  金星: { src: VenusImage.src, alt: "金星结果配图" },
  木卫二: { src: EuropaImage.src, alt: "木卫二结果配图" },
  天王星: { src: UranusImage.src, alt: "天王星结果配图" },
  木星: { src: JupiterImage.src, alt: "木星结果配图" },
  水星: { src: MercuryImage.src, alt: "水星结果配图" },
  土卫六: { src: TitanImage.src, alt: "土卫六结果配图" },
  木卫一: { src: IoImage.src, alt: "木卫一结果配图" },
  土星: { src: SaturnImage.src, alt: "土星结果配图" },
  谷神星: { src: CeresImage.src, alt: "谷神星结果配图" },
  太阳: { src: SunImage.src, alt: "太阳结果配图" },
  土卫二: { src: EnceladusImage.src, alt: "土卫二结果配图" },
};

export function getPlanetResultArtwork(title: string) {
  return PLANET_RESULT_ARTWORK[title] ?? null;
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npm run test:unit -- src/components/quiz/planet-result-artwork.test.ts`
Expected: PASS

### Task 3: Add a result-screen test that proves planet results render a real image

**Files:**
- Create or modify: `src/components/quiz/quiz-result-screen.test.tsx`
- Reference: `src/components/quiz/quiz-result-screen.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("renders the mapped artwork for planet_test results", () => {
  render(
    <QuizResultScreen
      attempt={planetCompletedAttempt}
      onReveal={() => {}}
      revealState="result"
      theme={planetTheme}
    />,
  );

  expect(screen.getByAltText("地球结果配图")).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/components/quiz/quiz-result-screen.test.tsx`
Expected: FAIL because the result screen still renders the placeholder glyph only

### Task 4: Render planet artwork in the reserved slot and preserve overlays

**Files:**
- Modify: `src/components/quiz/quiz-result-screen.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update the result screen implementation**

```tsx
import Image from "next/image";
import { getPlanetResultArtwork } from "@/src/components/quiz/planet-result-artwork";

const planetArtwork =
  attempt.slug === "planet_test" ? getPlanetResultArtwork(attempt.summary.result.title) : null;

<div className="quiz-artwork-slot" data-has-image={planetArtwork ? "true" : "false"}>
  {planetArtwork ? (
    <Image
      alt={planetArtwork.alt}
      className="quiz-artwork-slot__image"
      fill
      sizes="(min-width: 1024px) 18rem, 100vw"
      src={planetArtwork.src}
      style={{ objectFit: "cover", objectPosition: planetArtwork.objectPosition ?? "center center" }}
    />
  ) : null}
  <div className="quiz-artwork-slot__mesh" />
  <div className="quiz-artwork-slot__glow" />
  <div className="quiz-artwork-slot__content">
    ...existing text content...
  </div>
</div>
```

- [ ] **Step 2: Update CSS for image layering and responsive sizing**

```css
.quiz-artwork-slot__image {
  object-fit: cover;
  z-index: 0;
}

.quiz-artwork-slot__content {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 18rem;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
}

[data-quiz-theme="planet"] .quiz-artwork-slot[data-has-image="true"]::before {
  border-color: rgba(151, 183, 202, 0.32);
}

[data-quiz-theme="planet"] .quiz-artwork-slot[data-has-image="true"]::after {
  opacity: 0.72;
}
```

- [ ] **Step 3: Run the focused tests**

Run: `npm run test:unit -- src/components/quiz/planet-result-artwork.test.ts src/components/quiz/quiz-result-screen.test.tsx`
Expected: PASS

### Task 5: Verify the integration in the app build

**Files:**
- Modify: none

- [ ] **Step 1: Run the broader unit suite if nearby tests exist**

Run: `npm run test:unit`
Expected: PASS

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-04-03-planet-result-artwork-design.md docs/superpowers/plans/2026-04-03-planet-result-artwork.md src/components/quiz/planet-result-artwork.ts src/components/quiz/planet-result-artwork.test.ts src/components/quiz/quiz-result-screen.tsx app/globals.css
git commit -m "feat: add planet result artwork"
```

Do not run this step unless the user explicitly asks for a commit.
