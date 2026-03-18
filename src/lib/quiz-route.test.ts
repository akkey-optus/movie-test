import { describe, expect, it } from "vitest";

import { getQuizRouteMeta } from "@/src/lib/quiz-route";

describe("getQuizRouteMeta", () => {
  it("returns the dedicated heading for planet_test", () => {
    expect(getQuizRouteMeta("planet_test")).toEqual({
      slug: "planet_test",
      heading: "planet_test scaffold",
      description:
        "This placeholder route proves the dynamic App Router path exists and is ready for later quiz engine wiring.",
    });
  });

  it("builds a readable heading for future quiz slugs", () => {
    expect(getQuizRouteMeta("movie_test-special")).toMatchObject({
      slug: "movie_test-special",
      heading: "Movie Test Special scaffold",
    });
  });
});
