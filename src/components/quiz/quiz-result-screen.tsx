"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useLongPress } from "react-use";
import { toPng } from "html-to-image";

import type { QuizExperienceTheme, QuizThemeId } from "@/src/components/quiz/quiz-theme";
import type { QuizAttemptRecord } from "@/src/lib/storage";

type CompletedAttempt = QuizAttemptRecord & {
  completedAt: string;
  summary: NonNullable<QuizAttemptRecord["summary"]>;
};

type QuizResultScreenProps = {
  attempt: CompletedAttempt;
  revealState: "gate" | "result";
  onReveal: () => void;
  theme: QuizExperienceTheme;
};

const HOLD_DURATION_MS = 900;
const HOLD_RING_RADIUS = 52;
const HOLD_RING_STROKE = 4;
const HOLD_RING_CIRCUMFERENCE = 2 * Math.PI * HOLD_RING_RADIUS;

function sanitizeFilenamePart(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, "-").trim();
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ResultArtworkGlyph({ themeId }: { themeId: QuizThemeId }) {
  if (themeId === "movie") {
    return (
      <svg aria-hidden="true" className="h-28 w-24 text-[color:var(--quiz-accent)]" focusable="false" viewBox="0 0 96 128">
        <rect x="10" y="10" width="76" height="108" rx="18" fill="none" opacity="0.26" stroke="currentColor" strokeWidth="1.6" />
        <rect x="20" y="22" width="56" height="84" rx="12" fill="none" opacity="0.2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M28 40H68M28 82H68" opacity="0.36" stroke="currentColor" strokeWidth="1.4" />
        <path d="M34 32V96M62 32V96" opacity="0.2" stroke="currentColor" strokeDasharray="4 7" strokeWidth="1.2" />
        <path d="M26 70C36 58 48 54 58 58C66 62 72 72 78 74" fill="none" opacity="0.46" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (themeId === "fairy") {
    return (
      <svg aria-hidden="true" className="h-28 w-24 text-[color:var(--quiz-accent)]" focusable="false" viewBox="0 0 96 128">
        <path d="M18 26C28 18 40 16 48 18C58 20 66 28 78 26" fill="none" opacity="0.34" stroke="currentColor" strokeWidth="1.6" />
        <path d="M16 72C28 56 40 52 50 58C60 64 68 80 80 82" fill="none" opacity="0.42" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="48" cy="54" fill="none" opacity="0.24" r="22" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="48" cy="54" fill="none" opacity="0.14" r="12" stroke="currentColor" strokeWidth="1.3" />
        <path d="M48 18V108" opacity="0.2" stroke="currentColor" strokeDasharray="4 8" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-28 w-24 text-[color:var(--quiz-accent)]" focusable="false" viewBox="0 0 96 128">
      <circle cx="48" cy="52" fill="none" opacity="0.28" r="28" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="48" cy="52" fill="none" opacity="0.16" r="16" stroke="currentColor" strokeWidth="1.4" />
      <path d="M24 58L38 46L50 62L66 38L78 50" fill="none" opacity="0.46" stroke="currentColor" strokeWidth="1.6" />
      <path d="M48 16V108" opacity="0.22" stroke="currentColor" strokeDasharray="4 8" strokeWidth="1.2" />
    </svg>
  );
}

export function QuizResultScreen({ attempt, revealState, onReveal, theme }: QuizResultScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const didTriggerHoldRef = useRef(false);
  const [hintState, setHintState] = useState<"idle" | "holding" | "tap">("idle");
  const [isPressing, setIsPressing] = useState(false);
  const [pressCycle, setPressCycle] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const detailCards = useMemo(() => {
    const { extras } = attempt.summary.result;

    return [
      extras.whyLikeThis
        ? {
            label: "为什么会落在这里",
            value: extras.whyLikeThis,
          }
        : null,
      extras.representative?.length
        ? {
            label: "同行人物",
            value: extras.representative.join(" · "),
          }
        : null,
      extras.representativeWorks?.length
        ? {
            label: "延伸片单 / 线索",
            value: extras.representativeWorks.join(" / "),
          }
        : null,
    ].filter((item): item is { label: string; value: string } => Boolean(item));
  }, [attempt.summary.result]);

  const handleExportImage = useCallback(async () => {
    if (!exportCardRef.current || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const dataUrl = await toPng(exportCardRef.current, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `${attempt.slug}-result-${sanitizeFilenamePart(attempt.summary.result.title)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export image:", error);
    } finally {
      setIsExporting(false);
    }
  }, [attempt.slug, attempt.summary.result.title, isExporting]);

  const revealHandlers = useLongPress(
    () => {
      didTriggerHoldRef.current = true;
      setIsPressing(false);
      setHintState("idle");
      onReveal();
    },
    {
      delay: HOLD_DURATION_MS,
      isPreventDefault: true,
    },
  );

  const hintCopy =
    hintState === "holding"
      ? theme.result.holdHintHolding
      : hintState === "tap"
        ? theme.result.holdHintTap
        : theme.result.holdHintIdle;
  const itemTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.46, ease: "easeOut" as const };
  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: itemTransition },
  };
  const sectionVariants = {
    hidden: {},
    visible: {
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { staggerChildren: 0.08, delayChildren: 0.04 },
    },
  };

  function handlePressStart() {
    if (revealState === "result") {
      return;
    }

    didTriggerHoldRef.current = false;
    setPressCycle((current) => current + 1);
    setIsPressing(true);
    setHintState("holding");
  }

  function handlePressRelease() {
    if (revealState === "result") {
      return;
    }

    setIsPressing(false);

    if (!didTriggerHoldRef.current) {
      setHintState("tap");
    }
  }

  function handlePressCancel() {
    if (revealState === "result") {
      return;
    }

    setIsPressing(false);

    if (!didTriggerHoldRef.current) {
      setHintState("idle");
    }
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      {revealState === "gate" ? (
        <motion.section
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="atlas-panel grid rounded-[var(--quiz-radius-panel)] p-5 shadow-[0_24px_72px_rgba(1,8,18,0.24)] sm:p-6"
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -16, scale: 0.985 }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
          key="result-gate"
          transition={itemTransition}
        >
          <div className="relative z-10 space-y-5">
            <div className="space-y-3">
              <p className="detail-label text-[11px] text-[color:var(--quiz-accent)]">{theme.result.gateLabel}</p>
              <h2 className="editorial-title max-w-[13ch] text-4xl leading-tight text-[color:var(--quiz-text)] sm:text-[3rem]">
                {theme.result.gateTitle}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                {theme.result.gateDescription}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
              <div className="flex justify-center lg:justify-start">
                <motion.button
                  aria-label="按住揭晓你的结果"
                  className="group relative flex h-[9rem] w-[9rem] cursor-pointer items-center justify-center rounded-full border border-[color:var(--quiz-border-strong)] bg-[radial-gradient(circle_at_30%_30%,var(--quiz-accent-warm-fill)_0%,rgba(7,18,31,0.96)_72%)] text-[color:var(--quiz-text)] shadow-[0_20px_48px_rgba(1,8,18,0.28)]"
                  data-testid="reveal-result-button"
                  onMouseDown={(event) => {
                    handlePressStart();
                    revealHandlers.onMouseDown(event);
                  }}
                  onMouseLeave={() => {
                    revealHandlers.onMouseLeave();
                    handlePressCancel();
                  }}
                  onMouseUp={() => {
                    revealHandlers.onMouseUp();
                    handlePressRelease();
                  }}
                  onTouchEnd={() => {
                    revealHandlers.onTouchEnd();
                    handlePressRelease();
                  }}
                  onTouchStart={(event) => {
                    handlePressStart();
                    revealHandlers.onTouchStart(event);
                  }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                >
                  <motion.div
                    animate={isPressing ? { opacity: 0.95, scale: 1.05 } : { opacity: 0.55, scale: 1 }}
                    className="absolute inset-4 rounded-full bg-[radial-gradient(circle,var(--quiz-glow-primary)_0%,transparent_74%)]"
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
                  />

                  <svg aria-hidden className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
                    <title>Reveal progress</title>
                    <circle
                      cx="60"
                      cy="60"
                      fill="transparent"
                      r={HOLD_RING_RADIUS}
                      stroke="var(--quiz-border-soft)"
                      strokeWidth={HOLD_RING_STROKE}
                    />
                    <motion.circle
                      animate={{ strokeDashoffset: isPressing ? 0 : HOLD_RING_CIRCUMFERENCE }}
                      cx="60"
                      cy="60"
                      fill="transparent"
                      initial={{ strokeDashoffset: HOLD_RING_CIRCUMFERENCE }}
                      key={pressCycle}
                      r={HOLD_RING_RADIUS}
                      stroke="var(--quiz-accent)"
                      strokeDasharray={HOLD_RING_CIRCUMFERENCE}
                      strokeLinecap="round"
                      strokeWidth={HOLD_RING_STROKE}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : {
                              duration: HOLD_DURATION_MS / 1000,
                              ease: "linear",
                            }
                      }
                    />
                  </svg>

                  <div className="relative flex flex-col items-center gap-1 text-center">
                    <span className="detail-label text-[10px] text-[color:var(--quiz-accent-soft)]">
                      {isPressing ? theme.result.revealHoldingLabel : theme.result.revealIdleLabel}
                    </span>
                    <span className="editorial-title text-3xl leading-none text-[color:var(--quiz-text)]">
                      {isPressing ? theme.result.revealHoldingAction : theme.result.revealIdleAction}
                    </span>
                    <span className="text-xs text-[color:var(--quiz-muted)]">{theme.result.revealDurationLabel}</span>
                  </div>
                </motion.button>
              </div>

              <div className="rounded-[calc(var(--quiz-radius-panel)-0.2rem)] border border-[color:var(--quiz-border-soft)] bg-[rgba(240,232,215,0.03)] p-4">
                <p className="detail-label text-[11px] text-[color:var(--quiz-accent-soft)]">揭晓提示</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm leading-7 text-[color:var(--quiz-text)]"
                    exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    key={hintState}
                    transition={itemTransition}
                  >
                    {hintCopy}
                  </motion.p>
                </AnimatePresence>
                <p className="mt-3 text-xs leading-6 text-[color:var(--quiz-muted)]">
                  结果已经写入当前设备的本地记录，所以重新打开同一链接时会直接看到摘要，不会再次要求长按。
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="space-y-4"
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 22, scale: 0.985 }}
          key="result-card"
          transition={itemTransition}
        >
          <motion.div
            ref={exportCardRef}
            animate="visible"
            className="atlas-panel grid max-w-4xl gap-5 rounded-[var(--quiz-radius-panel)] p-5 shadow-[0_28px_80px_rgba(1,8,18,0.28)] sm:p-6"
            data-testid="quiz-result-card"
            initial="hidden"
            variants={sectionVariants}
          >
            <motion.div className="relative z-10 flex flex-wrap items-start justify-between gap-4" variants={itemVariants}>
              <div>
                <p className="detail-label text-[11px] text-[color:var(--quiz-accent-soft)]">{theme.result.summaryLabel}</p>
                <h2 className="mt-3 editorial-title text-5xl leading-none text-[color:var(--quiz-text)] sm:text-6xl">
                  {attempt.summary.result.title}
                </h2>
                <p className="mt-3 text-lg font-semibold text-[color:var(--quiz-text)] sm:text-2xl">
                  {theme.result.buildSummaryLead(attempt.summary.result.title)}
                </p>
              </div>

              <span className="rounded-full border border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-accent-soft-fill)] px-3 py-1 text-xs text-[color:var(--quiz-text)]">
                已保存 · {formatTimestamp(attempt.completedAt)}
              </span>
            </motion.div>

            <motion.div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-stretch" variants={itemVariants}>
              <motion.p
                className="max-w-3xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base"
                variants={itemVariants}
              >
                {attempt.summary.result.description}
              </motion.p>

              <div className="quiz-artwork-slot">
                <div className="quiz-artwork-slot__mesh" />
                <div className="quiz-artwork-slot__glow" />
                <div className="relative z-10 flex h-full min-h-[18rem] flex-col justify-between p-4 sm:p-5">
                  <div className="space-y-3">
                    <p className="detail-label text-[10px] text-[color:var(--quiz-accent)]">{theme.result.artworkEyebrow}</p>
                    <h3 className="editorial-title text-2xl leading-tight text-[color:var(--quiz-text)]">{theme.result.artworkTitle}</h3>
                    <p className="text-sm leading-6 text-[color:var(--quiz-muted)]">{theme.result.artworkDescription}</p>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <p className="max-w-[11rem] text-xs leading-5 text-[color:var(--quiz-muted)]">{theme.result.exportNote}</p>
                    <ResultArtworkGlyph themeId={theme.id} />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="relative z-10 flex flex-wrap gap-2" variants={itemVariants}>
              {attempt.summary.result.keywords.map((keyword) => (
                <motion.span
                  className="rounded-full border border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-accent-soft-fill)] px-3 py-1 text-xs text-[color:var(--quiz-text)]"
                  key={keyword}
                  variants={itemVariants}
                >
                  {keyword}
                </motion.span>
              ))}
            </motion.div>

            {detailCards.length > 0 ? (
              <motion.div className="relative z-10 grid gap-3 lg:grid-cols-3" variants={itemVariants}>
                {detailCards.map((item) => (
                  <div
                    className="rounded-[calc(var(--quiz-radius-panel)-0.35rem)] border border-[color:var(--quiz-border-soft)] bg-[rgba(240,232,215,0.03)] p-4"
                    key={item.label}
                  >
                    <p className="detail-label text-[10px] text-[color:var(--quiz-accent)]">{item.label}</p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-text)]">{item.value}</p>
                  </div>
                ))}
              </motion.div>
            ) : null}

            <motion.div
              className="relative z-10 rounded-[calc(var(--quiz-radius-panel)-0.25rem)] border border-dashed border-[color:var(--quiz-border-soft)] bg-[rgba(240,232,215,0.03)] p-4"
              variants={itemVariants}
            >
              <p className="detail-label text-[10px] text-[color:var(--quiz-accent)]">收束语</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-text)] sm:text-base">
                {attempt.summary.result.closing}
              </p>
            </motion.div>
          </motion.div>

          <motion.div className="flex flex-wrap gap-3" variants={itemVariants}>
            <motion.button
              className="metal-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold tracking-[0.08em] transition duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-80"
              data-testid="export-image-button"
              disabled={isExporting}
              onClick={handleExportImage}
              type="button"
              whileTap={prefersReducedMotion || isExporting ? undefined : { scale: 0.985 }}
            >
              {isExporting ? (
                <span>导出中...</span>
              ) : (
                <>
                  <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <title>Export image</title>
                    <path
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span>保存为图片</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
