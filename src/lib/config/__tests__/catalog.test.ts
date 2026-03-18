import rawQuizCatalogConfig from "@/test-setting.json";
import { loadQuizCatalogFromSource, QuizCatalogConfigError, validateQuizCatalogConfig } from "@/src/lib/config";

describe("quiz config catalog", () => {
  it("loads planet, movie, and xianling quizzes into one normalized contract", () => {
    const catalog = loadQuizCatalogFromSource(rawQuizCatalogConfig);

    expect(catalog.slugs).toEqual(["planet_test", "movie_test", "xianling_test"]);
    expect(catalog.meta.resultCount).toBe(16);
    expect(catalog.meta.tieBreaker).toEqual(["I", "N", "F", "P"]);

    for (const slug of catalog.slugs) {
      const quiz = catalog.quizzes[slug];

      expect(quiz.questions).toHaveLength(8);
      expect(quiz.results).toHaveLength(16);
      expect(Object.keys(quiz.resultsByType)).toHaveLength(16);
      expect(quiz.results[0]).toEqual(
        expect.objectContaining({
          type: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          keywords: expect.any(Array),
          closing: expect.any(String),
          extras: expect.any(Object),
        }),
      );
    }

    expect(catalog.quizzes.planet_test.resultsByType.ESTJ).toEqual({
      type: "ESTJ",
      title: "地球",
      description: expect.stringContaining("真实世界里建立秩序"),
      keywords: ["现实感", "执行力", "掌控感"],
      closing: "你会把理想落到地面上，这本身就是一种很强的能力。",
      extras: {
        representative: ["文明系统", "生态秩序", "日常运转"],
      },
    });

    expect(catalog.quizzes.movie_test.resultsByType.ESTJ.extras).toEqual({
      representativeWorks: ["当幸福来敲门", "国王的演讲", "阿甘正传"],
      whyLikeThis: "你的人生有很强的主线感，不容易散。",
    });

    expect(catalog.quizzes.xianling_test.resultsByType.ESTJ.extras).toEqual({
      representative: ["金阙", "长阶", "仙庭仪轨"],
    });
  });

  it("fails deterministically on duplicate question ids", () => {
    const brokenConfig = structuredClone(rawQuizCatalogConfig);
    brokenConfig.tests[0].questions[1].id = "Q1";

    expect(() => validateQuizCatalogConfig(brokenConfig)).toThrowError(QuizCatalogConfigError);

    try {
      validateQuizCatalogConfig(brokenConfig);
    } catch (error) {
      expect(error).toBeInstanceOf(QuizCatalogConfigError);
      expect((error as QuizCatalogConfigError).issues).toContain(
        'tests[0].questions: quiz "planet_test" has duplicate question id "Q1"',
      );
    }
  });

  it("fails deterministically when a result record is missing", () => {
    const brokenConfig = structuredClone(rawQuizCatalogConfig);
    delete brokenConfig.tests[1].results.INTJ;

    expect(() => validateQuizCatalogConfig(brokenConfig)).toThrowError(QuizCatalogConfigError);

    try {
      validateQuizCatalogConfig(brokenConfig);
    } catch (error) {
      expect(error).toBeInstanceOf(QuizCatalogConfigError);
      expect((error as QuizCatalogConfigError).issues).toContain(
        'tests[1].results: quiz "movie_test" is missing result records for: INTJ',
      );
    }
  });
});
