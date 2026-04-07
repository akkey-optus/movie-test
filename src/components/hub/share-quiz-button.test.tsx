import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ShareQuizButton } from "@/src/components/hub/share-quiz-button";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

describe("ShareQuizButton", () => {
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

  it("shows a success state after copying the generated share link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    await act(async () => {
      root.render(<ShareQuizButton slug="planet_test" title="星球测试" />);
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]?.[0]).toContain(`${window.location.origin}/quiz/planet_test?token=`);
    expect(button?.textContent).toContain("复制成功");
    expect(container.textContent).toContain("分享链接已复制");
  });

  it("reveals a readonly fallback field when clipboard copy is unavailable", async () => {
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });

    await act(async () => {
      root.render(<ShareQuizButton slug="movie_test" title="电影测试" />);
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(button?.textContent).toContain("复制失败");
    expect(container.textContent).toContain("复制失败，请手动复制下方链接");
    expect(container.textContent).toContain("手动复制");

    const fallbackField = container.querySelector("input[readonly]");
    expect(fallbackField).not.toBeNull();
    expect(fallbackField?.getAttribute("value")).toContain(`${window.location.origin}/quiz/movie_test?token=`);
  });

});
