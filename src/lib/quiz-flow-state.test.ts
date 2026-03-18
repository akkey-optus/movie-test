import { describe, expect, it } from "vitest";

import rawQuizCatalogConfig from "@/test-setting.json";
import { loadQuizCatalogFromSource } from "@/src/lib/config";
import { applyQuizAnswer, createQuizFlowProgress } from "@/src/lib/quiz-flow-state";

const catalog = loadQuizCatalogFromSource(rawQuizCatalogConfig);
const planetQuiz = catalog.quizzes.planet_test;

describe("quiz flow state", () => {
  it("restores the next active question from stored answers", () => {
    const progress = createQuizFlowProgress(
      planetQuiz,
      {
        Q1: "A",
        Q2: "B",
        Q3: "A",
      },
      3,
    );

    expect(progress).toEqual({
      activeQuestionIndex: 3,
      answeredCount: 3,
      totalQuestions: 8,
      currentQuestionId: "Q4",
      isComplete: false,
    });
  });

  it("advances to the next question after recording an answer", () => {
    const nextState = applyQuizAnswer(
      planetQuiz,
      {
        Q1: "A",
        Q2: "B",
        Q3: "A",
      },
      3,
      "B",
      catalog.meta.tieBreaker,
    );

    expect(nextState.kind).toBe("in-progress");

    if (nextState.kind !== "in-progress") {
      throw new Error("Expected in-progress state");
    }

    expect(nextState.answers).toMatchObject({
      Q1: "A",
      Q2: "B",
      Q3: "A",
      Q4: "B",
    });
    expect(nextState.progress).toEqual({
      activeQuestionIndex: 4,
      answeredCount: 4,
      totalQuestions: 8,
      currentQuestionId: "Q5",
      isComplete: false,
    });
  });

  it("returns the completion handoff once the eighth answer lands", () => {
    const completedState = applyQuizAnswer(
      planetQuiz,
      {
        Q1: "A",
        Q2: "A",
        Q3: "A",
        Q4: "A",
        Q5: "B",
        Q6: "B",
        Q7: "B",
      },
      7,
      "B",
      catalog.meta.tieBreaker,
    );

    expect(completedState.kind).toBe("complete");

    if (completedState.kind !== "complete") {
      throw new Error("Expected complete state");
    }

    expect(completedState.progress).toMatchObject({
      activeQuestionIndex: 7,
      answeredCount: 8,
      totalQuestions: 8,
      currentQuestionId: "Q8",
      isComplete: true,
    });
    expect(completedState.score.mbtiType).toBe("INFP");
    expect(completedState.score.result.title).toBe("木卫二");
  });
});
