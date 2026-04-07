"use client";

import { useState } from "react";

import { buildShareQuizLink, createShareToken, getShareExpireAt } from "@/src/lib/share/share-link";

type ShareQuizButtonProps = {
  slug: string;
  title: string;
};

type ShareState =
  | {
      status: "idle" | "success";
      shareLink: null;
    }
  | {
      status: "fallback";
      shareLink: string;
    };

export function ShareQuizButton({ slug, title }: ShareQuizButtonProps) {
  const [shareState, setShareState] = useState<ShareState>({
    status: "idle",
    shareLink: null,
  });
  const [isCopying, setIsCopying] = useState(false);

  async function handleShare() {
    if (isCopying) {
      return;
    }

    const shareLink = buildShareQuizLink({
      expireAt: getShareExpireAt(),
      origin: window.location.origin,
      slug,
      token: createShareToken(),
    });

    setIsCopying(true);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(shareLink);
      setShareState({ status: "success", shareLink: null });
    } catch {
      setShareState({ status: "fallback", shareLink });
    } finally {
      setIsCopying(false);
    }
  }

  const buttonLabel =
    isCopying
      ? "正在生成链接"
      : shareState.status === "success"
        ? "复制成功"
        : shareState.status === "fallback"
          ? "复制失败，显示链接"
          : "复制分享链接";
  const statusMessage =
    shareState.status === "success"
      ? "分享链接已复制"
      : shareState.status === "fallback"
        ? "复制失败，请手动复制下方链接"
        : null;

  return (
    <div className="space-y-3">
      <button
        aria-label={isCopying ? `正在生成 ${title} 的分享链接` : `${buttonLabel}：${title}`}
        className="ghost-button inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold tracking-[0.08em] transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--page-accent-cool-strong)]"
        data-testid="share-quiz-button"
        disabled={isCopying}
        onClick={handleShare}
        type="button"
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M8.5 12a3.5 3.5 0 0 1 0-5l2-2a3.5 3.5 0 0 1 5 5l-.75.75M15.5 12a3.5 3.5 0 0 1 0 5l-2 2a3.5 3.5 0 0 1-5-5l.75-.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        <span>{buttonLabel}</span>
      </button>

      {statusMessage ? (
        <p aria-live="polite" className="text-xs leading-6 text-[color:var(--page-muted)]" role="status">
          {statusMessage}
        </p>
      ) : null}

      {shareState.status === "fallback" ? (
        <div className="rounded-[1rem] border border-[color:var(--page-border)] bg-[rgba(240,232,215,0.03)] px-4 py-3 text-left">
          <p className="detail-label text-[10px] text-[color:var(--page-accent-cool)]">手动复制</p>
          <label className="sr-only" htmlFor={`share-link-${slug}`}>
            {title} 分享链接
          </label>
          <input
            className="mt-2 w-full rounded-[0.85rem] border border-[color:var(--page-border)] bg-[rgba(12,18,28,0.24)] px-3 py-2 text-xs leading-6 text-[color:var(--page-text)]"
            id={`share-link-${slug}`}
            readOnly
            type="text"
            value={shareState.shareLink}
          />
        </div>
      ) : null}
    </div>
  );
}
