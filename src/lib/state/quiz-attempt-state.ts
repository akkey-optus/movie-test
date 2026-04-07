import type { QuizDefinition } from "@/src/lib/config";
import { isShareTokenValid } from "@/src/lib/share/share-link";
import {
  createQuizAttemptStorage,
  getAnsweredQuestionCount,
  isCompletedQuizAttempt,
  type QuizAttemptRecord,
  type QuizAttemptStorage,
} from "@/src/lib/storage";

export type ResolveQuizRouteStateParams = {
  quiz: QuizDefinition;
  slug: string;
  token?: string | null;
  expireAt?: number | null;
  now?: number;
  storage?: QuizAttemptStorage;
};

type QuizRouteStateBase = {
  slug: string;
  token: string | null;
  expireAt: number | null;
};

export type QuizRouteIntroState = QuizRouteStateBase & {
  kind: "intro";
};

export type QuizRouteInProgressState = QuizRouteStateBase & {
  kind: "in-progress";
  attempt: QuizAttemptRecord;
  answeredCount: number;
  nextQuestionIndex: number;
  nextQuestionId: string | null;
};

export type QuizRouteSummaryState = QuizRouteStateBase & {
  kind: "summary";
  attempt: QuizAttemptRecord & {
    completedAt: string;
    summary: NonNullable<QuizAttemptRecord["summary"]>;
  };
};

export type QuizRouteExpiredState = QuizRouteStateBase & {
  kind: "expired";
  attempt: QuizAttemptRecord | null;
};

export type QuizRouteStorageUnavailableState = QuizRouteStateBase & {
  kind: "storage-unavailable";
};

export type QuizRouteState =
  | QuizRouteIntroState
  | QuizRouteInProgressState
  | QuizRouteSummaryState
  | QuizRouteExpiredState
  | QuizRouteStorageUnavailableState;

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

export function isQuizLinkExpired(expireAt?: number | null, now = Date.now()) {
  return typeof expireAt === "number" && Number.isFinite(expireAt) && expireAt <= now;
}

function isTokenAccessible(token: string | null, expireAt: number | null, now: number) {
  if (!token || !isShareTokenValid(token) || expireAt === null) {
    return false;
  }

  return !isQuizLinkExpired(expireAt, now);
}

export function resolveQuizRouteState({
  quiz,
  slug,
  token,
  expireAt,
  now = Date.now(),
  storage = createQuizAttemptStorage(),
}: ResolveQuizRouteStateParams): QuizRouteState {
  const normalizedToken = normalizeToken(token);
  const normalizedExpireAt = normalizeExpireAt(expireAt);
  const baseState = {
    slug,
    token: normalizedToken,
    expireAt: normalizedExpireAt,
  };

  if (!isTokenAccessible(normalizedToken, normalizedExpireAt, now)) {
    return {
      kind: "expired",
      ...baseState,
      attempt: null,
    };
  }

  if (!storage.isAvailable()) {
    return {
      kind: "storage-unavailable",
      ...baseState,
    };
  }

  const attempt = storage.readAttempt({
    quiz,
    slug,
    token: normalizedToken,
    expireAt: normalizedExpireAt,
  });

  if (isCompletedQuizAttempt(attempt)) {
    return {
      kind: "summary",
      ...baseState,
      attempt,
    };
  }

  if (!attempt) {
    return {
      kind: "intro",
      ...baseState,
    };
  }

  const answeredCount = getAnsweredQuestionCount(quiz, attempt.answers);

  if (answeredCount === 0) {
    return {
      kind: "intro",
      ...baseState,
    };
  }

  return {
    kind: "in-progress",
    ...baseState,
    attempt,
    answeredCount,
    nextQuestionIndex: answeredCount,
    nextQuestionId: quiz.questions[answeredCount]?.id ?? null,
  };
}
