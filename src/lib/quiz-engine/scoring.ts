import { MBTI_DIMENSIONS, type MbtiDimension, type MbtiType, type QuizDefinition, type QuizResult } from "@/src/lib/config";

export const DEFAULT_MBTI_TIE_BREAKER = ["I", "N", "F", "P"] as const;

export type QuizAnswers = Record<string, string>;

type DimensionCodePair<TDimension extends MbtiDimension = MbtiDimension> =
  TDimension extends `${infer TLeft}/${infer TRight}` ? [TLeft, TRight] : never;

type DimensionLetter<TDimension extends MbtiDimension = MbtiDimension> = DimensionCodePair<TDimension>[number];

export type DimensionScoreMap<TDimension extends MbtiDimension = MbtiDimension> = Record<DimensionLetter<TDimension>, number>;

export type DimensionTally<TDimension extends MbtiDimension = MbtiDimension> = {
  dimension: TDimension;
  scores: DimensionScoreMap<TDimension>;
  winner: DimensionLetter<TDimension>;
  tie: boolean;
};

export type QuizScoreTallies = {
  [TDimension in MbtiDimension]: DimensionTally<TDimension>;
};

export type QuizScoreResult = {
  answers: QuizAnswers;
  tallies: QuizScoreTallies;
  mbtiType: MbtiType;
  result: QuizResult;
};

function getDimensionPair<TDimension extends MbtiDimension>(dimension: TDimension): DimensionCodePair<TDimension> {
  const [left, right] = dimension.split("/") as DimensionCodePair<TDimension>;
  return [left, right] as DimensionCodePair<TDimension>;
}

function createEmptyTallies(): QuizScoreTallies {
  return Object.fromEntries(
    MBTI_DIMENSIONS.map((dimension) => {
      const [left, right] = getDimensionPair(dimension);

      return [
        dimension,
        {
          dimension,
          scores: {
            [left]: 0,
            [right]: 0,
          },
          winner: left,
          tie: false,
        },
      ];
    }),
  ) as QuizScoreTallies;
}

function assertAnswerOption(questionId: string, optionId: string | undefined, validOptionIds: string[]) {
  if (!optionId) {
    throw new Error(`Missing answer for question "${questionId}".`);
  }

  if (!validOptionIds.includes(optionId)) {
    throw new Error(
      `Invalid answer "${optionId}" for question "${questionId}". Expected one of: ${validOptionIds.join(", ")}.`,
    );
  }
}

export function scoreQuizDefinition(
  quiz: QuizDefinition,
  answers: QuizAnswers,
  tieBreaker: readonly string[] = DEFAULT_MBTI_TIE_BREAKER,
): QuizScoreResult {
  const tallies = createEmptyTallies();

  for (const question of quiz.questions) {
    const answerId = answers[question.id];
    const optionIds = question.options.map((option) => option.id);
    assertAnswerOption(question.id, answerId, optionIds);

    const option = question.options.find((candidate) => candidate.id === answerId);

    if (!option) {
      throw new Error(`Unable to resolve answer "${answerId}" for question "${question.id}".`);
    }

    const tally = tallies[question.dimension];
    const scores = tally.scores as Record<string, number>;
    const validCodes = new Set(Object.keys(scores));

    for (const [code, value] of Object.entries(option.scores)) {
      if (!validCodes.has(code)) {
        throw new Error(
          `Invalid score code "${code}" on question "${question.id}" for dimension "${question.dimension}".`,
        );
      }

      scores[code] += value;
    }
  }

  const mbtiType = resolveMbtiTypeFromTallies(tallies, tieBreaker);
  const result = quiz.resultsByType[mbtiType];

  if (!result) {
    throw new Error(`Missing result payload for MBTI type "${mbtiType}" in quiz "${quiz.slug}".`);
  }

  return {
    answers: { ...answers },
    tallies,
    mbtiType,
    result,
  };
}

export function resolveMbtiTypeFromTallies(
  tallies: QuizScoreTallies,
  tieBreaker: readonly string[] = DEFAULT_MBTI_TIE_BREAKER,
): MbtiType {
  const code = MBTI_DIMENSIONS.map((dimension, index) => {
    const [left, right] = getDimensionPair(dimension);
    const scores = tallies[dimension].scores as Record<string, number>;
    const leftScore = scores[left];
    const rightScore = scores[right];

    if (leftScore === rightScore) {
      const preferredCode = tieBreaker[index];

      if (preferredCode !== left && preferredCode !== right) {
        throw new Error(
          `Tie breaker code "${preferredCode}" does not match dimension "${dimension}" at index ${index}.`,
        );
      }

      tallies[dimension].winner = preferredCode;
      tallies[dimension].tie = true;
      return preferredCode;
    }

    const winner = leftScore > rightScore ? left : right;
    tallies[dimension].winner = winner;
    tallies[dimension].tie = false;
    return winner;
  }).join("");

  return code as MbtiType;
}
