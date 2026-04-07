import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import rawQuizCatalogConfig from "@/test-setting.json";
import { QuizFlow } from "@/src/components/quiz/quiz-flow";
import { getQuizExperienceTheme } from "@/src/components/quiz/quiz-theme";
import { loadQuizCatalogFromSource } from "@/src/lib/config";

const catalog = loadQuizCatalogFromSource(rawQuizCatalogConfig);
const quiz = catalog.quizzes.planet_test;

describe("QuizFlow", () => {
  it("keeps the in-progress layout single-column without the old aside", () => {
    const markup = renderToStaticMarkup(
      <QuizFlow
        expireAt={4102444800000}
        initialAnswers={{}}
        initialQuestionIndex={0}
        isResume={false}
        onComplete={() => {}}
        onProgress={() => {}}
        onStorageUnavailable={() => {}}
        quiz={quiz}
        slug={quiz.slug}
        theme={getQuizExperienceTheme(quiz, quiz.slug)}
        tieBreaker={catalog.meta.tieBreaker}
        token="demo-token"
      />,
    );

    expect(markup).not.toContain("quiz-flow-aside");
    expect(markup).not.toContain("页边批注");
  });
});
