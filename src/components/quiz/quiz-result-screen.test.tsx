import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import rawQuizCatalogConfig from "@/test-setting.json";
import { QuizResultScreen } from "@/src/components/quiz/quiz-result-screen";
import { getQuizExperienceTheme } from "@/src/components/quiz/quiz-theme";
import { loadQuizCatalogFromSource } from "@/src/lib/config";
import { scoreQuizDefinition } from "@/src/lib/quiz-engine";

const catalog = loadQuizCatalogFromSource(rawQuizCatalogConfig);

function buildUniformAnswers(quizSlug: keyof typeof catalog.quizzes, optionId: "A" | "B") {
  const quiz = catalog.quizzes[quizSlug];

  return Object.fromEntries(quiz.questions.map((question) => [question.id, optionId]));
}

function buildCompletedAttempt(quizSlug: keyof typeof catalog.quizzes, optionId: "A" | "B") {
  const quiz = catalog.quizzes[quizSlug];
  const answers = buildUniformAnswers(quizSlug, optionId);
  const score = scoreQuizDefinition(quiz, answers);

  return {
    version: "v1" as const,
    slug: quizSlug,
    token: "demo-token",
    expireAt: 4102444800000,
    answers,
    completedAt: "2026-03-18T12:00:00.000Z",
    summary: {
      mbtiType: score.mbtiType,
      result: score.result,
    },
    updatedAt: "2026-03-18T12:00:00.000Z",
  };
}

describe("QuizResultScreen", () => {
  it("renders the mapped artwork for planet_test results", () => {
    const quiz = catalog.quizzes.planet_test;
    const markup = renderToStaticMarkup(
      <QuizResultScreen
        attempt={buildCompletedAttempt("planet_test", "A")}
        onReveal={() => {}}
        revealState="result"
        theme={getQuizExperienceTheme(quiz, quiz.slug)}
      />,
    );

    expect(markup).toContain("quiz-artwork-slot");
    expect(markup).toContain("地球结果配图");
  });
});
