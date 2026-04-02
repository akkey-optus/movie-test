import { describe, expect, it } from "vitest";

import rawQuizCatalogConfig from "@/test-setting.json";
import { loadQuizCatalogFromSource } from "@/src/lib/config";
import { scoreQuizDefinition } from "@/src/lib/quiz-engine";
import { resolveQuizRouteState } from "@/src/lib/state";
import { createQuizAttemptStorage, getQuizAttemptStorageKey, type StorageLike } from "@/src/lib/storage";

const planetQuiz = loadQuizCatalogFromSource(rawQuizCatalogConfig).quizzes.planet_test;
const validExpireAt = 4102444800000;
const now = new Date("2026-03-18T12:00:00.000Z");

class MemoryStorage implements StorageLike {
  private readonly store = new Map<string, string>();

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }
}

class ThrowingStorage implements StorageLike {
  getItem(_key: string): string | null {
    throw new Error("Storage unavailable");
  }

  setItem(_key: string, _value: string): void {
    throw new Error("Storage unavailable");
  }

  removeItem(_key: string): void {
    throw new Error("Storage unavailable");
  }
}

function buildAnswers(optionIds: Array<"A" | "B">) {
  return Object.fromEntries(optionIds.map((optionId, index) => [planetQuiz.questions[index].id, optionId]));
}

describe("quiz attempt storage and route state", () => {
  it("uses the versioned slug-plus-token storage key", () => {
    expect(getQuizAttemptStorageKey({ slug: "planet_test", token: "demo" })).toBe("quiz-attempt:v1:planet_test:demo");
    expect(getQuizAttemptStorageKey({ slug: "planet_test", token: "" })).toBe("quiz-attempt:v1:planet_test:default");
  });

  it("resumes an unfinished valid attempt at step 4 after 3 answers", () => {
    const storage = createQuizAttemptStorage(new MemoryStorage());

    storage.writeProgress({
      quiz: planetQuiz,
      slug: planetQuiz.slug,
      token: "demo",
      expireAt: validExpireAt,
      answers: buildAnswers(["A", "B", "A"]),
      now,
    });

    const state = resolveQuizRouteState({
      quiz: planetQuiz,
      slug: planetQuiz.slug,
      token: "demo",
      expireAt: validExpireAt,
      now: now.getTime(),
      storage,
    });

    expect(state).toMatchObject({
      kind: "in-progress",
      answeredCount: 3,
      nextQuestionIndex: 3,
      nextQuestionId: planetQuiz.questions[3].id,
    });
  });

  it("returns summary state for a completed attempt on the same browser", () => {
    const storage = createQuizAttemptStorage(new MemoryStorage());
    const answers = buildAnswers(["A", "A", "A", "A", "A", "A", "A", "A"]);

    storage.writeCompletion({
      quiz: planetQuiz,
      slug: planetQuiz.slug,
      token: "done-demo",
      expireAt: validExpireAt,
      answers,
      score: scoreQuizDefinition(planetQuiz, answers),
      now,
    });

    const state = resolveQuizRouteState({
      quiz: planetQuiz,
      slug: planetQuiz.slug,
      token: "done-demo",
      expireAt: validExpireAt,
      now: now.getTime(),
      storage,
    });

    expect(state.kind).toBe("summary");

    if (state.kind !== "summary") {
      throw new Error("Expected summary state");
    }

    expect(state.attempt.summary.mbtiType).toBe("ESTJ");
    expect(state.attempt.summary.result.title).toBe("地球");
  });

  it("returns expired state for an expired incomplete attempt", () => {
    const storage = createQuizAttemptStorage(new MemoryStorage());

    storage.writeProgress({
      quiz: planetQuiz,
      slug: planetQuiz.slug,
      token: "expired-demo",
      expireAt: validExpireAt,
      answers: buildAnswers(["A", "B"]),
      now,
    });

    const state = resolveQuizRouteState({
      quiz: planetQuiz,
      slug: planetQuiz.slug,
      token: "expired-demo",
      expireAt: 1,
      now: now.getTime(),
      storage,
    });

    expect(state.kind).toBe("expired");
  });

  it("returns summary state for an expired completed attempt", () => {
    const storage = createQuizAttemptStorage(new MemoryStorage());
    const answers = buildAnswers(["B", "B", "B", "B", "B", "B", "B", "B"]);

    storage.writeCompletion({
      quiz: planetQuiz,
      slug: planetQuiz.slug,
      token: "expired-complete-demo",
      expireAt: validExpireAt,
      answers,
      score: scoreQuizDefinition(planetQuiz, answers),
      now,
    });

    const state = resolveQuizRouteState({
      quiz: planetQuiz,
      slug: planetQuiz.slug,
      token: "expired-complete-demo",
      expireAt: 1,
      now: now.getTime(),
      storage,
    });

    expect(state.kind).toBe("summary");

    if (state.kind !== "summary") {
      throw new Error("Expected summary state");
    }

    expect(state.attempt.summary.mbtiType).toBe("INFP");
    expect(state.attempt.summary.result.title).toBe("木卫二");
  });

  it("resets malformed JSON safely and falls back to intro state", () => {
    const backingStorage = new MemoryStorage();
    const storage = createQuizAttemptStorage(backingStorage);
    const key = getQuizAttemptStorageKey({ slug: planetQuiz.slug, token: "demo" });

    backingStorage.setItem(key, "not-json");

    const state = resolveQuizRouteState({
      quiz: planetQuiz,
      slug: planetQuiz.slug,
      token: "demo",
      expireAt: validExpireAt,
      now: now.getTime(),
      storage,
    });

    expect(state.kind).toBe("intro");
    expect(backingStorage.getItem(key)).toBeNull();
  });

  it("returns storage-unavailable when local storage access fails", () => {
    const storage = createQuizAttemptStorage(new ThrowingStorage());

    const state = resolveQuizRouteState({
      quiz: planetQuiz,
      slug: planetQuiz.slug,
      token: "demo",
      expireAt: validExpireAt,
      now: now.getTime(),
      storage,
    });

    expect(state.kind).toBe("storage-unavailable");
  });
});
