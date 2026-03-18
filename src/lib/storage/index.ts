export {
  QUIZ_ATTEMPT_STORAGE_VERSION,
  createQuizAttemptStorage,
  getAnsweredQuestionCount,
  getQuizAttemptStorageKey,
  isCompletedQuizAttempt,
} from "@/src/lib/storage/quiz-attempt-storage";
export type {
  QuizAttemptCompletionParams,
  QuizAttemptReadParams,
  QuizAttemptRecord,
  QuizAttemptStorage,
  QuizAttemptStorageKeyParams,
  QuizAttemptStorageSummary,
  QuizAttemptWriteParams,
  StorageLike,
} from "@/src/lib/storage/quiz-attempt-storage";
