import { describe, expect, it } from "vitest";

import rawQuizCatalogConfig from "@/test-setting.json";
import { loadQuizCatalogFromSource } from "@/src/lib/config";
import { scoreQuizDefinition } from "@/src/lib/quiz-engine";

const planetQuiz = loadQuizCatalogFromSource(rawQuizCatalogConfig).quizzes.planet_test;

function buildUniformAnswers(optionId: "A" | "B") {
  return Object.fromEntries(planetQuiz.questions.map((question) => [question.id, optionId]));
}

describe("MBTI scoring engine", () => {
  it("resolves all A answers for planet_test to ESTJ and 地球", () => {
    const score = scoreQuizDefinition(planetQuiz, buildUniformAnswers("A"));

    expect(score.mbtiType).toBe("ESTJ");
    expect(score.result).toEqual(planetQuiz.resultsByType.ESTJ);
    expect(score.result.title).toBe("地球");
    expect(score.tallies).toEqual({
      "E/I": {
        dimension: "E/I",
        scores: { E: 2, I: 0 },
        winner: "E",
        tie: false,
      },
      "S/N": {
        dimension: "S/N",
        scores: { S: 2, N: 0 },
        winner: "S",
        tie: false,
      },
      "T/F": {
        dimension: "T/F",
        scores: { T: 2, F: 0 },
        winner: "T",
        tie: false,
      },
      "J/P": {
        dimension: "J/P",
        scores: { J: 2, P: 0 },
        winner: "J",
        tie: false,
      },
    });
  });

  it("resolves all B answers for planet_test to INFP and 木卫二", () => {
    const score = scoreQuizDefinition(planetQuiz, buildUniformAnswers("B"));

    expect(score.mbtiType).toBe("INFP");
    expect(score.result).toEqual(planetQuiz.resultsByType.INFP);
    expect(score.result.title).toBe("木卫二");
    expect(score.tallies).toEqual({
      "E/I": {
        dimension: "E/I",
        scores: { E: 0, I: 2 },
        winner: "I",
        tie: false,
      },
      "S/N": {
        dimension: "S/N",
        scores: { S: 0, N: 2 },
        winner: "N",
        tie: false,
      },
      "T/F": {
        dimension: "T/F",
        scores: { T: 0, F: 2 },
        winner: "F",
        tie: false,
      },
      "J/P": {
        dimension: "J/P",
        scores: { J: 0, P: 2 },
        winner: "P",
        tie: false,
      },
    });
  });

  it("uses the configured I/N/F/P tie breaker when every dimension ties", () => {
    const score = scoreQuizDefinition(planetQuiz, {
      Q1: "A",
      Q2: "A",
      Q3: "A",
      Q4: "A",
      Q5: "B",
      Q6: "B",
      Q7: "B",
      Q8: "B",
    });

    expect(score.mbtiType).toBe("INFP");
    expect(score.result.title).toBe("木卫二");
    expect(score.tallies).toEqual({
      "E/I": {
        dimension: "E/I",
        scores: { E: 1, I: 1 },
        winner: "I",
        tie: true,
      },
      "S/N": {
        dimension: "S/N",
        scores: { S: 1, N: 1 },
        winner: "N",
        tie: true,
      },
      "T/F": {
        dimension: "T/F",
        scores: { T: 1, F: 1 },
        winner: "F",
        tie: true,
      },
      "J/P": {
        dimension: "J/P",
        scores: { J: 1, P: 1 },
        winner: "P",
        tie: true,
      },
    });
  });
});
