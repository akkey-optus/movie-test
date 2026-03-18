import { rawQuizCatalogConfig } from "@/src/config/test-setting";
import { adaptResultExtras } from "@/src/lib/config/adapters";
import { validateQuizCatalogConfig } from "@/src/lib/config/schema";
import { MBTI_TYPES, type MbtiType, type QuizCatalog, type QuizDefinition, type QuizResult, type QuizTypeMapping } from "@/src/lib/config/types";

function buildTypeLabels(quizId: string, sharedTypeMapping: QuizCatalogSource["shared_type_mapping"]): QuizTypeMapping {
  const themeKey = quizId.replace(/_test$/, "").replace(/_quiz$/, "");
  const entries = sharedTypeMapping.map((mapping) => {
    const label = mapping[themeKey as keyof typeof mapping];
    return [mapping.type, label] as const;
  });

  return Object.fromEntries(entries) as QuizTypeMapping;
}

type QuizCatalogSource = ReturnType<typeof validateQuizCatalogConfig>;

function normalizeQuizDefinition(source: QuizCatalogSource, quiz: QuizCatalogSource["tests"][number]): QuizDefinition {
  const typeLabels = buildTypeLabels(quiz.id, source.shared_type_mapping);

  const results = MBTI_TYPES.map((type) => {
    const result = quiz.results[type];
    const normalizedResult: QuizResult = {
      type,
      title: result.title,
      description: result.description,
      keywords: [...result.keywords],
      closing: result.closing,
      extras: adaptResultExtras(quiz, result),
    };

    return normalizedResult;
  });

  const resultsByType = Object.fromEntries(results.map((result) => [result.type, result])) as Record<
    MbtiType,
    QuizResult
  >;

  return {
    slug: quiz.id,
    theme: quiz.theme,
    title: quiz.title,
    subtitle: quiz.subtitle,
    intro: quiz.intro,
    typeLabels,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      text: question.text,
      dimension: question.dimension as QuizDefinition["questions"][number]["dimension"],
      options: question.options.map((option) => ({
        id: option.id,
        text: option.text,
        scores: { ...option.scores },
      })),
    })),
    results,
    resultsByType,
  };
}

export function normalizeQuizCatalog(source: QuizCatalogSource): QuizCatalog {
  const quizzes = Object.fromEntries(
    source.tests.map((quiz) => [quiz.id, normalizeQuizDefinition(source, quiz)]),
  );

  return {
    meta: {
      version: source.meta.version,
      language: source.meta.language,
      dimensions: source.meta.type_system.dimensions.map((dimension) => ({
        code_pair: [...dimension.code_pair] as [string, string],
        name: dimension.name,
      })),
      resultCount: source.meta.type_system.result_count,
      tieBreaker: [...source.meta.type_system.tie_breaker],
      scoringRules: { ...source.meta.type_system.scoring_rules },
      finalRule: source.meta.type_system.final_rule,
      disclaimer: source.meta.disclaimer,
    },
    quizzes,
    slugs: source.tests.map((quiz) => quiz.id),
  };
}

export function loadQuizCatalogFromSource(source: unknown) {
  return normalizeQuizCatalog(validateQuizCatalogConfig(source));
}

export function loadQuizCatalog() {
  return loadQuizCatalogFromSource(rawQuizCatalogConfig);
}

export function loadQuizDefinition(slug: string) {
  return loadQuizCatalog().quizzes[slug] ?? null;
}
