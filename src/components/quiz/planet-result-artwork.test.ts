import { describe, expect, it } from "vitest";

const expectedPlanetTitles = [
  "土星",
  "月球",
  "海王星",
  "冥王星",
  "火星",
  "金星",
  "木卫二",
  "天王星",
  "木星",
  "水星",
  "土卫六",
  "木卫一",
  "地球",
  "谷神星",
  "太阳",
  "土卫二",
] as const;

describe("getPlanetResultArtwork", () => {
  it("returns matching artwork metadata for every shipped planet result title", async () => {
    const { getPlanetResultArtwork } = await import("@/src/components/quiz/planet-result-artwork");

    for (const title of expectedPlanetTitles) {
      expect(getPlanetResultArtwork(title)).toEqual(
        expect.objectContaining({
          alt: expect.stringContaining(title),
          src: expect.any(String),
        }),
      );
    }
  });

  it("uses the lowercase saturn asset for 土星", async () => {
    const { getPlanetResultArtwork } = await import("@/src/components/quiz/planet-result-artwork");

    expect(getPlanetResultArtwork("土星")).toEqual(
      expect.objectContaining({
        alt: expect.stringContaining("土星"),
        src: expect.stringContaining("saturn"),
      }),
    );
  });

  it("returns null for unknown titles", async () => {
    const { getPlanetResultArtwork } = await import("@/src/components/quiz/planet-result-artwork");

    expect(getPlanetResultArtwork("不存在的星球")).toBeNull();
  });
});
