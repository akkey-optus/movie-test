import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toPng } from "html-to-image";

import rawQuizCatalogConfig from "@/test-setting.json";
import { QuizResultScreen } from "@/src/components/quiz/quiz-result-screen";
import { getQuizExperienceTheme } from "@/src/components/quiz/quiz-theme";
import { loadQuizCatalogFromSource } from "@/src/lib/config";
import { scoreQuizDefinition } from "@/src/lib/quiz-engine";

vi.mock("html-to-image", () => ({
  toPng: vi.fn().mockResolvedValue("data:image/png;base64,preview"),
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

const catalog = loadQuizCatalogFromSource(rawQuizCatalogConfig);

function buildUniformAnswers(quizSlug: keyof typeof catalog.quizzes, optionId: "A" | "B") {
  const quiz = catalog.quizzes[quizSlug];

  return Object.fromEntries(quiz.questions.map((question) => [question.id, optionId]));
}

function buildCompletedAttempt(quizSlug: keyof typeof catalog.quizzes, optionId: "A" | "B") {
  const quiz = catalog.quizzes[quizSlug];
  const answers = buildUniformAnswers(quizSlug, optionId);
  const score = scoreQuizDefinition(quiz, answers);

  return {
    version: "v1" as const,
    slug: quizSlug,
    token: "demo-token",
    expireAt: 4102444800000,
    answers,
    completedAt: "2026-03-18T12:00:00.000Z",
    summary: {
      mbtiType: score.mbtiType,
      result: score.result,
    },
    updatedAt: "2026-03-18T12:00:00.000Z",
  };
}

describe("QuizResultScreen", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("renders the mapped artwork for planet_test results", () => {
    const quiz = catalog.quizzes.planet_test;
    const markup = renderToStaticMarkup(
      <QuizResultScreen
        attempt={buildCompletedAttempt("planet_test", "A")}
        onReveal={() => {}}
        revealState="result"
        theme={getQuizExperienceTheme(quiz, quiz.slug)}
      />,
    );

    expect(markup).toContain("quiz-artwork-slot");
    expect(markup).toContain("地球结果配图");
  });

  it("opens a preview modal instead of downloading immediately", async () => {
    const quiz = catalog.quizzes.planet_test;
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        return {
          click: clickSpy,
          set download(_value: string) {},
          set href(_value: string) {},
        } as unknown as HTMLAnchorElement;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    await act(async () => {
      root.render(
        <QuizResultScreen
          attempt={buildCompletedAttempt("planet_test", "B")}
          onReveal={() => {}}
          revealState="result"
          theme={getQuizExperienceTheme(quiz, quiz.slug)}
        />,
      );
    });

    const saveButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("保存为图片"));

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(container.textContent).toContain("确认保存");
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("keeps the preview open and shows an error when export fails", async () => {
    const quiz = catalog.quizzes.planet_test;
    vi.mocked(toPng).mockRejectedValueOnce(new Error("export failed"));

    await act(async () => {
      root.render(
        <QuizResultScreen
          attempt={buildCompletedAttempt("planet_test", "B")}
          onReveal={() => {}}
          revealState="result"
          theme={getQuizExperienceTheme(quiz, quiz.slug)}
        />,
      );
    });

    const saveButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("保存为图片"));

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const confirmButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("确认保存"));

    await act(async () => {
      confirmButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(container.textContent).toContain("生成图片失败，请稍后再试");
    expect(container.textContent).toContain("确认保存");
  });

  it("cancels without downloading and only downloads after confirm", async () => {
    const quiz = catalog.quizzes.planet_test;
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        return {
          click: clickSpy,
          set download(_value: string) {},
          set href(_value: string) {},
        } as unknown as HTMLAnchorElement;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    await act(async () => {
      root.render(
        <QuizResultScreen
          attempt={buildCompletedAttempt("planet_test", "B")}
          onReveal={() => {}}
          revealState="result"
          theme={getQuizExperienceTheme(quiz, quiz.slug)}
        />,
      );
    });

    const saveButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("保存为图片"));

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const cancelButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "取消");
    await act(async () => {
      cancelButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(clickSpy).not.toHaveBeenCalled();

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const confirmButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "确认保存");
    await act(async () => {
      confirmButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("renders the preview poster inside the modal container", async () => {
    const quiz = catalog.quizzes.planet_test;

    await act(async () => {
      root.render(
        <QuizResultScreen
          attempt={buildCompletedAttempt("planet_test", "B")}
          onReveal={() => {}}
          revealState="result"
          theme={getQuizExperienceTheme(quiz, quiz.slug)}
        />,
      );
    });

    const saveButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("保存为图片"));

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const dialog = container.querySelector('[role="dialog"]');
    const poster = dialog?.querySelector("article");

    expect(dialog).not.toBeNull();
    expect(poster).not.toBeNull();
    expect(dialog?.contains(poster ?? null)).toBe(true);
  });
});
