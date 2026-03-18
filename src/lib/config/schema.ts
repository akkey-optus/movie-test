import {
  MBTI_DIMENSIONS,
  MBTI_TYPES,
  type MbtiDimension,
  type MbtiType,
  type SourceQuestion,
  type SourceQuestionOption,
  type SourceQuiz,
  type SourceQuizCatalog,
  type SourceResultRecord,
  type SourceTypeMapping,
} from "@/src/lib/config/types";

const EXPECTED_SCORING_RULES: Record<string, MbtiDimension> = {
  Q1_Q5: "E/I",
  Q2_Q6: "S/N",
  Q3_Q7: "T/F",
  Q4_Q8: "J/P",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatPath(path: string) {
  return path || "root";
}

function pushIssue(issues: string[], path: string, message: string) {
  issues.push(`${formatPath(path)}: ${message}`);
}

function requireObject(value: unknown, path: string, issues: string[]) {
  if (!isPlainObject(value)) {
    pushIssue(issues, path, "expected an object");
    return null;
  }

  return value;
}

function requireString(value: unknown, path: string, issues: string[]) {
  if (typeof value !== "string" || value.length === 0) {
    pushIssue(issues, path, "expected a non-empty string");
    return null;
  }

  return value;
}

function requireNumber(value: unknown, path: string, issues: string[]) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    pushIssue(issues, path, "expected a number");
    return null;
  }

  return value;
}

function requireStringArray(value: unknown, path: string, issues: string[]) {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, "expected an array of strings");
    return null;
  }

  const entries = value.map((entry, index) => requireString(entry, `${path}[${index}]`, issues));
  if (entries.some((entry) => entry === null)) {
    return null;
  }

  return entries as string[];
}

function requireStringRecord(value: unknown, path: string, issues: string[]) {
  const record = requireObject(value, path, issues);
  if (!record) {
    return null;
  }

  const parsed: Record<string, string> = {};
  for (const [key, entry] of Object.entries(record)) {
    const parsedValue = requireString(entry, `${path}.${key}`, issues);
    if (parsedValue !== null) {
      parsed[key] = parsedValue;
    }
  }

  return parsed;
}

function validateQuestionOption(
  value: unknown,
  path: string,
  issues: string[],
  questionDimension: string,
): SourceQuestionOption | null {
  const option = requireObject(value, path, issues);
  if (!option) {
    return null;
  }

  const id = requireString(option.id, `${path}.id`, issues);
  const text = requireString(option.text, `${path}.text`, issues);
  const scoresObject = requireObject(option.scores, `${path}.scores`, issues);

  if (!id || !text || !scoresObject) {
    return null;
  }

  const scoreEntries = Object.entries(scoresObject);
  if (scoreEntries.length !== 1) {
    pushIssue(issues, `${path}.scores`, "expected exactly one score entry");
    return null;
  }

  const [scoreKey, scoreValue] = scoreEntries[0];
  const parsedScore = requireNumber(scoreValue, `${path}.scores.${scoreKey}`, issues);
  if (parsedScore === null) {
    return null;
  }

  const dimensionCodes = questionDimension.split("/");
  if (!dimensionCodes.includes(scoreKey)) {
    pushIssue(
      issues,
      `${path}.scores.${scoreKey}`,
      `must match question dimension ${questionDimension}`,
    );
  }

  return {
    id,
    text,
    scores: { [scoreKey]: parsedScore },
  };
}

function validateQuestion(value: unknown, path: string, issues: string[]): SourceQuestion | null {
  const question = requireObject(value, path, issues);
  if (!question) {
    return null;
  }

  const id = requireString(question.id, `${path}.id`, issues);
  const text = requireString(question.text, `${path}.text`, issues);
  const dimension = requireString(question.dimension, `${path}.dimension`, issues);

  if (dimension && !MBTI_DIMENSIONS.includes(dimension as MbtiDimension)) {
    pushIssue(issues, `${path}.dimension`, `must be one of ${MBTI_DIMENSIONS.join(", ")}`);
  }

  if (!Array.isArray(question.options)) {
    pushIssue(issues, `${path}.options`, "expected an array with exactly two options");
    return null;
  }

  if (question.options.length !== 2) {
    pushIssue(issues, `${path}.options`, "expected exactly two options");
  }

  const optionIdSet = new Set<string>();
  const options = question.options
    .map((option, index) =>
      validateQuestionOption(option, `${path}.options[${index}]`, issues, dimension ?? ""),
    )
    .filter((option): option is SourceQuestionOption => option !== null);

  for (const option of options) {
    if (optionIdSet.has(option.id)) {
      pushIssue(issues, `${path}.options`, `contains duplicate option id \"${option.id}\"`);
    }
    optionIdSet.add(option.id);
  }

  if (!id || !text || !dimension) {
    return null;
  }

  return {
    id,
    text,
    dimension,
    options,
  };
}

function validateResultRecord(value: unknown, path: string, issues: string[]): SourceResultRecord | null {
  const result = requireObject(value, path, issues);
  if (!result) {
    return null;
  }

  const title = requireString(result.title, `${path}.title`, issues);
  const description = requireString(result.description, `${path}.description`, issues);
  const keywords = requireStringArray(result.keywords, `${path}.keywords`, issues);
  const closing = requireString(result.closing, `${path}.closing`, issues);

  const representative =
    result.representative === undefined
      ? undefined
      : requireStringArray(result.representative, `${path}.representative`, issues) ?? undefined;
  const representativeWorks =
    result.representative_works === undefined
      ? undefined
      : requireStringArray(
          result.representative_works,
          `${path}.representative_works`,
          issues,
        ) ?? undefined;
  const whyLikeThis =
    result.why_like_this === undefined
      ? undefined
      : requireString(result.why_like_this, `${path}.why_like_this`, issues) ?? undefined;

  if (!title || !description || !keywords || !closing) {
    return null;
  }

  return {
    title,
    description,
    keywords,
    closing,
    representative,
    representative_works: representativeWorks,
    why_like_this: whyLikeThis,
  };
}

function validateResults(
  value: unknown,
  path: string,
  issues: string[],
  quizId: string,
): Record<string, SourceResultRecord> | null {
  const results = requireObject(value, path, issues);
  if (!results) {
    return null;
  }

  const resultKeys = Object.keys(results).sort();
  const missingTypes = MBTI_TYPES.filter((type) => !resultKeys.includes(type));
  const unknownTypes = resultKeys.filter((type) => !MBTI_TYPES.includes(type as MbtiType));

  if (missingTypes.length > 0) {
    pushIssue(path === "" ? issues : issues, path, `quiz \"${quizId}\" is missing result records for: ${missingTypes.join(", ")}`);
  }

  if (unknownTypes.length > 0) {
    pushIssue(path === "" ? issues : issues, path, `quiz \"${quizId}\" has unknown result records: ${unknownTypes.join(", ")}`);
  }

  const parsedResults: Record<string, SourceResultRecord> = {};
  for (const [type, result] of Object.entries(results)) {
    const parsedResult = validateResultRecord(result, `${path}.${type}`, issues);
    if (parsedResult) {
      parsedResults[type] = parsedResult;
    }
  }

  return parsedResults;
}

function validateQuiz(value: unknown, path: string, issues: string[]): SourceQuiz | null {
  const quiz = requireObject(value, path, issues);
  if (!quiz) {
    return null;
  }

  const id = requireString(quiz.id, `${path}.id`, issues);
  const theme = requireString(quiz.theme, `${path}.theme`, issues);
  const title = requireString(quiz.title, `${path}.title`, issues);
  const subtitle = requireString(quiz.subtitle, `${path}.subtitle`, issues);
  const intro = requireString(quiz.intro, `${path}.intro`, issues);

  if (!Array.isArray(quiz.questions)) {
    pushIssue(issues, `${path}.questions`, "expected an array with exactly eight questions");
    return null;
  }

  if (quiz.questions.length !== 8) {
    pushIssue(issues, `${path}.questions`, "expected exactly eight questions");
  }

  const questions = quiz.questions
    .map((question, index) => validateQuestion(question, `${path}.questions[${index}]`, issues))
    .filter((question): question is SourceQuestion => question !== null);

  const questionIdSet = new Set<string>();
  for (const question of questions) {
    if (questionIdSet.has(question.id)) {
      pushIssue(issues, `${path}.questions`, `quiz \"${id ?? "unknown"}\" has duplicate question id \"${question.id}\"`);
    }
    questionIdSet.add(question.id);
  }

  const dimensionCounts = new Map<string, number>();
  for (const question of questions) {
    dimensionCounts.set(question.dimension, (dimensionCounts.get(question.dimension) ?? 0) + 1);
  }

  for (const dimension of MBTI_DIMENSIONS) {
    const count = dimensionCounts.get(dimension) ?? 0;
    if (count !== 2) {
      pushIssue(issues, `${path}.questions`, `quiz \"${id ?? "unknown"}\" must contain exactly two questions for dimension ${dimension}`);
    }
  }

  const results = validateResults(quiz.results, `${path}.results`, issues, id ?? "unknown");

  if (!id || !theme || !title || !subtitle || !intro || !results) {
    return null;
  }

  return {
    id,
    theme,
    title,
    subtitle,
    intro,
    questions,
    results,
  };
}

function validateTypeMapping(value: unknown, path: string, issues: string[]): SourceTypeMapping | null {
  const mapping = requireObject(value, path, issues);
  if (!mapping) {
    return null;
  }

  const type = requireString(mapping.type, `${path}.type`, issues);
  const planet = requireString(mapping.planet, `${path}.planet`, issues);
  const movie = requireString(mapping.movie, `${path}.movie`, issues);
  const xianling = requireString(mapping.xianling, `${path}.xianling`, issues);

  if (type && !MBTI_TYPES.includes(type as MbtiType)) {
    pushIssue(issues, `${path}.type`, `must be one of ${MBTI_TYPES.join(", ")}`);
  }

  if (!type || !planet || !movie || !xianling) {
    return null;
  }

  return {
    type: type as MbtiType,
    planet,
    movie,
    xianling,
  };
}

export class QuizCatalogConfigError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Quiz catalog config validation failed with ${issues.length} issue(s).`);
    this.name = "QuizCatalogConfigError";
    this.issues = issues;
  }
}

export function validateQuizCatalogConfig(value: unknown): SourceQuizCatalog {
  const issues: string[] = [];
  const root = requireObject(value, "", issues);
  if (!root) {
    throw new QuizCatalogConfigError(issues);
  }

  const meta = requireObject(root.meta, "meta", issues);
  const sharedTypeMappingValue = root.shared_type_mapping;
  const testsValue = root.tests;

  const version = meta ? requireString(meta.version, "meta.version", issues) : null;
  const language = meta ? requireString(meta.language, "meta.language", issues) : null;
  const disclaimer = meta ? requireString(meta.disclaimer, "meta.disclaimer", issues) : null;
  const typeSystem = meta ? requireObject(meta.type_system, "meta.type_system", issues) : null;

  let dimensions: SourceQuizCatalog["meta"]["type_system"]["dimensions"] = [];
  let resultCount = 0;
  let tieBreaker: string[] = [];
  let scoringRules: Record<string, string> = {};
  let finalRule = "";

  if (typeSystem) {
    if (!Array.isArray(typeSystem.dimensions)) {
      pushIssue(issues, "meta.type_system.dimensions", "expected an array of four dimensions");
    } else {
      if (typeSystem.dimensions.length !== 4) {
        pushIssue(issues, "meta.type_system.dimensions", "expected exactly four dimensions");
      }

      dimensions = typeSystem.dimensions
        .map((dimension, index) => {
          const parsed = requireObject(dimension, `meta.type_system.dimensions[${index}]`, issues);
          if (!parsed) {
            return null;
          }

          const codePair = parsed.code_pair;
          const name = requireString(parsed.name, `meta.type_system.dimensions[${index}].name`, issues);

          if (!Array.isArray(codePair) || codePair.length !== 2) {
            pushIssue(
              issues,
              `meta.type_system.dimensions[${index}].code_pair`,
              "expected exactly two codes",
            );
            return null;
          }

          const first = requireString(codePair[0], `meta.type_system.dimensions[${index}].code_pair[0]`, issues);
          const second = requireString(codePair[1], `meta.type_system.dimensions[${index}].code_pair[1]`, issues);
          if (!name || !first || !second) {
            return null;
          }

          return {
            code_pair: [first, second] as [string, string],
            name,
          };
        })
        .filter((dimension): dimension is SourceQuizCatalog["meta"]["type_system"]["dimensions"][number] => dimension !== null);
    }

    const parsedResultCount = requireNumber(typeSystem.result_count, "meta.type_system.result_count", issues);
    if (parsedResultCount !== null) {
      resultCount = parsedResultCount;
      if (parsedResultCount !== 16) {
        pushIssue(issues, "meta.type_system.result_count", "expected the fixed MBTI result count of 16");
      }
    }

    tieBreaker = requireStringArray(typeSystem.tie_breaker, "meta.type_system.tie_breaker", issues) ?? [];
    if (tieBreaker.length > 0 && tieBreaker.join(",") !== "I,N,F,P") {
      pushIssue(issues, "meta.type_system.tie_breaker", "expected tie breaker I,N,F,P");
    }

    scoringRules = requireStringRecord(typeSystem.scoring_rules, "meta.type_system.scoring_rules", issues) ?? {};
    for (const [ruleKey, ruleValue] of Object.entries(EXPECTED_SCORING_RULES)) {
      if (scoringRules[ruleKey] !== ruleValue) {
        pushIssue(
          issues,
          `meta.type_system.scoring_rules.${ruleKey}`,
          `expected ${ruleValue}`,
        );
      }
    }

    finalRule = requireString(typeSystem.final_rule, "meta.type_system.final_rule", issues) ?? "";
  }

  if (!Array.isArray(sharedTypeMappingValue)) {
    pushIssue(issues, "shared_type_mapping", "expected an array with 16 entries");
  }

  const sharedTypeMapping = Array.isArray(sharedTypeMappingValue)
    ? sharedTypeMappingValue
        .map((entry, index) => validateTypeMapping(entry, `shared_type_mapping[${index}]`, issues))
        .filter((entry): entry is SourceTypeMapping => entry !== null)
    : [];

  if (sharedTypeMapping.length !== 16) {
    pushIssue(issues, "shared_type_mapping", "expected exactly 16 shared type mapping entries");
  }

  const mappingTypes = sharedTypeMapping.map((entry) => entry.type);
  const duplicateMappingTypes = mappingTypes.filter((type, index) => mappingTypes.indexOf(type) !== index);
  if (duplicateMappingTypes.length > 0) {
    pushIssue(
      issues,
      "shared_type_mapping",
      `contains duplicate type mappings for: ${Array.from(new Set(duplicateMappingTypes)).join(", ")}`,
    );
  }

  const missingMappingTypes = MBTI_TYPES.filter((type) => !mappingTypes.includes(type));
  if (missingMappingTypes.length > 0) {
    pushIssue(
      issues,
      "shared_type_mapping",
      `is missing type mappings for: ${missingMappingTypes.join(", ")}`,
    );
  }

  if (!Array.isArray(testsValue)) {
    pushIssue(issues, "tests", "expected an array of quizzes");
  }

  const tests = Array.isArray(testsValue)
    ? testsValue
        .map((quiz, index) => validateQuiz(quiz, `tests[${index}]`, issues))
        .filter((quiz): quiz is SourceQuiz => quiz !== null)
    : [];

  const quizIds = tests.map((quiz) => quiz.id);
  const duplicateQuizIds = quizIds.filter((id, index) => quizIds.indexOf(id) !== index);
  if (duplicateQuizIds.length > 0) {
    pushIssue(issues, "tests", `contains duplicate quiz ids: ${Array.from(new Set(duplicateQuizIds)).join(", ")}`);
  }

  if (issues.length > 0 || !meta || !version || !language || !disclaimer) {
    throw new QuizCatalogConfigError(issues);
  }

  return {
    meta: {
      version,
      language,
      type_system: {
        dimensions,
        result_count: resultCount,
        tie_breaker: tieBreaker,
        scoring_rules: scoringRules,
        final_rule: finalRule,
      },
      disclaimer,
    },
    shared_type_mapping: sharedTypeMapping,
    tests,
  };
}
