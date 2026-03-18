import { MBTI_TYPES, type MbtiType, type QuizDefinition, type QuizResult } from "@/src/lib/config";
import type { QuizAnswers, QuizScoreResult } from "@/src/lib/quiz-engine";

export const QUIZ_ATTEMPT_STORAGE_VERSION = "v1" as const;

export type QuizAttemptStorageKeyParams = {
  slug: string;
  token?: string | null;
};

export type QuizAttemptStorageSummary = {
  mbtiType: MbtiType;
  result: QuizResult;
};

export type QuizAttemptRecord = {
  version: typeof QUIZ_ATTEMPT_STORAGE_VERSION;
  slug: string;
  token: string | null;
  expireAt: number | null;
  answers: QuizAnswers;
  completedAt: string | null;
  summary: QuizAttemptStorageSummary | null;
  updatedAt: string;
};

export type QuizAttemptWriteParams = {
  quiz: QuizDefinition;
  slug: string;
  token?: string | null;
  expireAt?: number | null;
  answers: QuizAnswers;
  now?: Date;
};

export type QuizAttemptReadParams = Omit<QuizAttemptWriteParams, "answers" | "now">;

export type QuizAttemptCompletionParams = QuizAttemptWriteParams & {
  score: Pick<QuizScoreResult, "mbtiType" | "result">;
};

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type QuizAttemptStorage = {
  getKey(params: QuizAttemptStorageKeyParams): string;
  isAvailable(): boolean;
  readAttempt(params: QuizAttemptReadParams): QuizAttemptRecord | null;
  writeProgress(params: QuizAttemptWriteParams): QuizAttemptRecord | null;
  writeCompletion(params: QuizAttemptCompletionParams): QuizAttemptRecord | null;
  clearAttempt(params: QuizAttemptStorageKeyParams): void;
};

function normalizeToken(token?: string | null) {
  if (typeof token !== "string") {
    return null;
  }

  const normalizedToken = token.trim();
  return normalizedToken.length > 0 ? normalizedToken : null;
}

function normalizeExpireAt(expireAt?: number | null) {
  return typeof expireAt === "number" && Number.isFinite(expireAt) ? expireAt : null;
}

function nowIsoString(now?: Date) {
  return (now ?? new Date()).toISOString();
}

function resolveStorage(storage?: StorageLike): StorageLike | null {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStoredSummary(value: unknown): value is QuizAttemptStorageSummary {
  if (!isPlainObject(value)) {
    return false;
  }

  if (typeof value.mbtiType !== "string" || !MBTI_TYPES.includes(value.mbtiType as MbtiType)) {
    return false;
  }

  const result = value.result;

  if (!isPlainObject(result)) {
    return false;
  }

  const keywords = result.keywords;
  const extras = result.extras;

  if (
    result.type !== value.mbtiType ||
    typeof result.title !== "string" ||
    typeof result.description !== "string" ||
    !Array.isArray(keywords) ||
    keywords.some((keyword) => typeof keyword !== "string") ||
    typeof result.closing !== "string" ||
    !isPlainObject(extras)
  ) {
    return false;
  }

  return true;
}

function sanitizeAnswers(quiz: QuizDefinition, rawAnswers: unknown): QuizAnswers {
  if (!isPlainObject(rawAnswers)) {
    return {};
  }

  const answers: QuizAnswers = {};

  for (const question of quiz.questions) {
    const answerId = rawAnswers[question.id];

    if (typeof answerId !== "string") {
      break;
    }

    const isValidAnswer = question.options.some((option) => option.id === answerId);

    if (!isValidAnswer) {
      break;
    }

    answers[question.id] = answerId;
  }

  return answers;
}

function isStoredRecord(value: unknown, quiz: QuizDefinition, slug: string, token: string | null): value is QuizAttemptRecord {
  if (!isPlainObject(value)) {
    return false;
  }

  if (
    value.version !== QUIZ_ATTEMPT_STORAGE_VERSION ||
    value.slug !== slug ||
    value.token !== token ||
    (value.expireAt !== null && typeof value.expireAt !== "number") ||
    typeof value.updatedAt !== "string"
  ) {
    return false;
  }

  const answers = sanitizeAnswers(quiz, value.answers);
  const completedAt = value.completedAt;
  const summary = value.summary;

  if (!isPlainObject(value.answers) || Object.keys(answers).length !== Object.keys(value.answers).length) {
    return false;
  }

  if (completedAt === null && summary === null) {
    return true;
  }

  return typeof completedAt === "string" && isStoredSummary(summary);
}

function createRecord(
  params: Pick<QuizAttemptWriteParams, "slug" | "token" | "expireAt"> & {
    answers: QuizAnswers;
    summary?: QuizAttemptStorageSummary | null;
    completedAt?: string | null;
    now?: Date;
  },
): QuizAttemptRecord {
  return {
    version: QUIZ_ATTEMPT_STORAGE_VERSION,
    slug: params.slug,
    token: normalizeToken(params.token),
    expireAt: normalizeExpireAt(params.expireAt),
    answers: { ...params.answers },
    completedAt: params.completedAt ?? null,
    summary: params.summary ?? null,
    updatedAt: nowIsoString(params.now),
  };
}

export function getQuizAttemptStorageKey({ slug, token }: QuizAttemptStorageKeyParams) {
  return `quiz-attempt:${QUIZ_ATTEMPT_STORAGE_VERSION}:${slug}:${normalizeToken(token) ?? "default"}`;
}

export function isCompletedQuizAttempt(attempt: QuizAttemptRecord | null): attempt is QuizAttemptRecord & {
  completedAt: string;
  summary: QuizAttemptStorageSummary;
} {
  return Boolean(attempt?.completedAt && attempt.summary);
}

export function getAnsweredQuestionCount(quiz: QuizDefinition, answers: QuizAnswers) {
  return Object.keys(sanitizeAnswers(quiz, answers)).length;
}

export function createQuizAttemptStorage(storage?: StorageLike): QuizAttemptStorage {
  function withStorage<T>(callback: (resolvedStorage: StorageLike) => T, fallback: T) {
    const resolvedStorage = resolveStorage(storage);

    if (!resolvedStorage) {
      return fallback;
    }

    try {
      return callback(resolvedStorage);
    } catch {
      return fallback;
    }
  }

  const getKey = getQuizAttemptStorageKey;
  const isAvailable = () =>
    withStorage((resolvedStorage) => {
      resolvedStorage.getItem(getQuizAttemptStorageKey({ slug: "__probe__" }));
      return true;
    }, false);
  const readAttempt = ({ quiz, slug, token, expireAt }: QuizAttemptReadParams) => {
      const normalizedToken = normalizeToken(token);
      const key = getQuizAttemptStorageKey({ slug, token: normalizedToken });

      return withStorage((resolvedStorage) => {
        const rawValue = resolvedStorage.getItem(key);

        if (rawValue === null) {
          return null;
        }

        try {
          const parsed = JSON.parse(rawValue) as unknown;

          if (!isStoredRecord(parsed, quiz, slug, normalizedToken)) {
            resolvedStorage.removeItem(key);
            return null;
          }

          return createRecord({
            slug,
            token: normalizedToken,
            expireAt: normalizeExpireAt(expireAt) ?? parsed.expireAt,
            answers: sanitizeAnswers(quiz, parsed.answers),
            completedAt: parsed.completedAt,
            summary: parsed.summary,
            now: new Date(parsed.updatedAt),
          });
        } catch {
          resolvedStorage.removeItem(key);
          return null;
        }
      }, null);
    };
  const clearAttempt = ({ slug, token }: QuizAttemptStorageKeyParams) => {
    withStorage((resolvedStorage) => {
      resolvedStorage.removeItem(getKey({ slug, token }));
    }, undefined);
  };
  const writeProgress = ({ quiz, slug, token, expireAt, answers, now }: QuizAttemptWriteParams) => {
      const normalizedToken = normalizeToken(token);
      const sanitizedAnswers = sanitizeAnswers(quiz, answers);

      if (Object.keys(sanitizedAnswers).length === 0) {
        clearAttempt({ slug, token: normalizedToken });
        return null;
      }

      const record = createRecord({
        slug,
        token: normalizedToken,
        expireAt,
        answers: sanitizedAnswers,
        now,
      });

      return withStorage((resolvedStorage) => {
        resolvedStorage.setItem(getKey({ slug, token: normalizedToken }), JSON.stringify(record));
        return record;
      }, null);
    };
  const writeCompletion = ({ quiz, slug, token, expireAt, answers, score, now }: QuizAttemptCompletionParams) => {
      const normalizedToken = normalizeToken(token);
      const sanitizedAnswers = sanitizeAnswers(quiz, answers);
      const record = createRecord({
        slug,
        token: normalizedToken,
        expireAt,
        answers: sanitizedAnswers,
        completedAt: nowIsoString(now),
        summary: {
          mbtiType: score.mbtiType,
          result: score.result,
        },
        now,
      });

      return withStorage((resolvedStorage) => {
        resolvedStorage.setItem(getKey({ slug, token: normalizedToken }), JSON.stringify(record));
        return record;
      }, null);
    };

  return {
    getKey,
    isAvailable,
    readAttempt,
    writeProgress,
    writeCompletion,
    clearAttempt,
  };
}
