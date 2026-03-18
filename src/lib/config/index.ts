export { loadQuizCatalog, loadQuizCatalogFromSource, loadQuizDefinition, normalizeQuizCatalog } from "@/src/lib/config/catalog";
export { QuizCatalogConfigError, validateQuizCatalogConfig } from "@/src/lib/config/schema";
export { MBTI_DIMENSIONS, MBTI_TYPES } from "@/src/lib/config/types";
export type {
  MbtiDimension,
  MbtiType,
  QuizCatalog,
  QuizDefinition,
  QuizQuestion,
  QuizQuestionOption,
  QuizResult,
  QuizResultExtras,
  QuizTypeMapping,
  SourceQuiz,
  SourceQuizCatalog,
  SourceResultRecord,
} from "@/src/lib/config/types";
