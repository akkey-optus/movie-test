import type { QuizDefinition } from "@/src/lib/config";
import { scoreQuizDefinition, type QuizAnswers, type QuizScoreResult } from "@/src/lib/quiz-engine";

export type QuizFlowProgress = {
  activeQuestionIndex: number;
  answeredCount: number;
  totalQuestions: number;
  currentQuestionId: string | null;
  isComplete: boolean;
};

export type QuizFlowAdvanceResult =
  | {
      kind: "in-progress";
      answers: QuizAnswers;
      progress: QuizFlowProgress;
    }
  | {
      kind: "complete";
      answers: QuizAnswers;
      progress: QuizFlowProgress;
      score: QuizScoreResult;
    };

function clampIndex(index: number, totalQuestions: number) {
  if (totalQuestions <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), totalQuestions - 1);
}

function countSequentialAnswers(quiz: QuizDefinition, answers: QuizAnswers) {
  let answeredCount = 0;

  for (const question of quiz.questions) {
    const answerId = answers[question.id];

    if (typeof answerId !== "string") {
      break;
    }

    const isValidAnswer = question.options.some((option) => option.id === answerId);

    if (!isValidAnswer) {
      break;
    }

    answeredCount += 1;
  }

  return answeredCount;
}

export function createQuizFlowProgress(
  quiz: QuizDefinition,
  answers: QuizAnswers,
  preferredQuestionIndex = 0,
): QuizFlowProgress {
  const totalQuestions = quiz.questions.length;
  const answeredCount = countSequentialAnswers(quiz, answers);
  const isComplete = answeredCount >= totalQuestions;
  const activeQuestionIndex = isComplete
    ? clampIndex(totalQuestions - 1, totalQuestions)
    : clampIndex(preferredQuestionIndex, totalQuestions);

  return {
    activeQuestionIndex,
    answeredCount,
    totalQuestions,
    currentQuestionId: quiz.questions[activeQuestionIndex]?.id ?? null,
    isComplete,
  };
}

export function applyQuizAnswer(
  quiz: QuizDefinition,
  answers: QuizAnswers,
  questionIndex: number,
  answerId: string,
  tieBreaker: readonly string[],
): QuizFlowAdvanceResult {
  const question = quiz.questions[questionIndex];

  if (!question) {
    throw new Error(`Question index ${questionIndex} is out of range for quiz "${quiz.slug}".`);
  }

  const isValidAnswer = question.options.some((option) => option.id === answerId);

  if (!isValidAnswer) {
    throw new Error(`Answer "${answerId}" is invalid for question "${question.id}".`);
  }

  const nextAnswers = {
    ...answers,
    [question.id]: answerId,
  };
  const answeredCount = countSequentialAnswers(quiz, nextAnswers);

  if (answeredCount >= quiz.questions.length) {
    return {
      kind: "complete",
      answers: nextAnswers,
      progress: createQuizFlowProgress(quiz, nextAnswers, quiz.questions.length - 1),
      score: scoreQuizDefinition(quiz, nextAnswers, tieBreaker),
    };
  }

  return {
    kind: "in-progress",
    answers: nextAnswers,
    progress: createQuizFlowProgress(quiz, nextAnswers, answeredCount),
  };
}
