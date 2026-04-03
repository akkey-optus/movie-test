import { describe, expect, it } from "vitest";

import rawQuizCatalogConfig from "@/test-setting.json";
import { getQuizExperienceTheme, resolveQuizThemeId } from "@/src/components/quiz/quiz-theme";
import { loadQuizCatalogFromSource } from "@/src/lib/config";

const catalog = loadQuizCatalogFromSource(rawQuizCatalogConfig);

describe("quiz experience theme", () => {
  it("maps the three shipped quizzes onto distinct theme ids", () => {
    expect(resolveQuizThemeId(catalog.quizzes.planet_test, "planet_test")).toBe("planet");
    expect(resolveQuizThemeId(catalog.quizzes.movie_test, "movie_test")).toBe("movie");
    expect(resolveQuizThemeId(catalog.quizzes.xianling_test, "xianling_test")).toBe("fairy");
  });

  it("falls back from slug and exposes theme-specific copy", () => {
    expect(getQuizExperienceTheme(null, "movie_test-preview")).toMatchObject({
      id: "movie",
      routeLabel: "银幕札记",
    });

    expect(getQuizExperienceTheme(null, "xianling_test-preview")).toMatchObject({
      id: "fairy",
      routeLabel: "云笺抄录",
    });
  });
});
