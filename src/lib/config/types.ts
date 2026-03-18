export const MBTI_DIMENSIONS = ["E/I", "S/N", "T/F", "J/P"] as const;
export const MBTI_TYPES = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
] as const;

export type MbtiDimension = (typeof MBTI_DIMENSIONS)[number];
export type MbtiType = (typeof MBTI_TYPES)[number];

export type SourceTypeSystemDimension = {
  code_pair: [string, string];
  name: string;
};

export type SourceTypeSystem = {
  dimensions: SourceTypeSystemDimension[];
  result_count: number;
  tie_breaker: string[];
  scoring_rules: Record<string, string>;
  final_rule: string;
};

export type SourceMeta = {
  version: string;
  language: string;
  type_system: SourceTypeSystem;
  disclaimer: string;
};

export type SourceTypeMapping = {
  type: MbtiType;
  planet: string;
  movie: string;
  xianling: string;
};

export type SourceQuestionOption = {
  id: string;
  text: string;
  scores: Record<string, number>;
};

export type SourceQuestion = {
  id: string;
  text: string;
  dimension: string;
  options: SourceQuestionOption[];
};

export type SourceResultRecord = {
  title: string;
  description: string;
  keywords: string[];
  closing: string;
  representative?: string[];
  representative_works?: string[];
  why_like_this?: string;
};

export type SourceQuiz = {
  id: string;
  theme: string;
  title: string;
  subtitle: string;
  intro: string;
  questions: SourceQuestion[];
  results: Record<string, SourceResultRecord>;
};

export type SourceQuizCatalog = {
  meta: SourceMeta;
  shared_type_mapping: SourceTypeMapping[];
  tests: SourceQuiz[];
};

export type QuizResultExtras = {
  representative?: string[];
  representativeWorks?: string[];
  whyLikeThis?: string;
};

export type QuizResult = {
  type: MbtiType;
  title: string;
  description: string;
  keywords: string[];
  closing: string;
  extras: QuizResultExtras;
};

export type QuizQuestionOption = {
  id: string;
  text: string;
  scores: Record<string, number>;
};

export type QuizQuestion = {
  id: string;
  text: string;
  dimension: MbtiDimension;
  options: QuizQuestionOption[];
};

export type QuizTypeMapping = Record<MbtiType, string>;

export type QuizDefinition = {
  slug: string;
  theme: string;
  title: string;
  subtitle: string;
  intro: string;
  typeLabels: QuizTypeMapping;
  questions: QuizQuestion[];
  results: QuizResult[];
  resultsByType: Record<MbtiType, QuizResult>;
};

export type QuizCatalog = {
  meta: {
    version: string;
    language: string;
    dimensions: SourceTypeSystemDimension[];
    resultCount: number;
    tieBreaker: string[];
    scoringRules: Record<string, string>;
    finalRule: string;
    disclaimer: string;
  };
  quizzes: Record<string, QuizDefinition>;
  slugs: string[];
};
