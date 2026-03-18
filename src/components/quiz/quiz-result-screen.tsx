"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { useLongPress } from "react-use";
import { toPng } from "html-to-image";

import type { QuizAttemptRecord } from "@/src/lib/storage";

type CompletedAttempt = QuizAttemptRecord & {
  completedAt: string;
  summary: NonNullable<QuizAttemptRecord["summary"]>;
};

type QuizResultScreenProps = {
  attempt: CompletedAttempt;
  revealState: "gate" | "result";
  onReveal: () => void;
};

const HOLD_DURATION_MS = 900;
const HOLD_RING_RADIUS = 52;
const HOLD_RING_STROKE = 4;
const HOLD_RING_CIRCUMFERENCE = 2 * Math.PI * HOLD_RING_RADIUS;

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function QuizResultScreen({ attempt, revealState, onReveal }: QuizResultScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const didTriggerHoldRef = useRef(false);
  const [hintState, setHintState] = useState<"idle" | "holding" | "tap">("idle");
  const [isPressing, setIsPressing] = useState(false);
  const [pressCycle, setPressCycle] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const handleExportImage = useCallback(async () => {
    if (!exportCardRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await toPng(exportCardRef.current, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = `${attempt.slug}-result-${attempt.summary.mbtiType}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
    } finally {
      setIsExporting(false);
    }
  }, [attempt.slug, attempt.summary.mbtiType, isExporting]);

  const revealHandlers = useLongPress(() => {
    didTriggerHoldRef.current = true;
    setIsPressing(false);
    setHintState("idle");
    onReveal();
  }, {
    delay: HOLD_DURATION_MS,
    isPreventDefault: true,
  });

  const hintCopy =
    hintState === "holding"
      ? "继续按住，轨道正在锁定你的归属星球。"
      : hintState === "tap"
        ? "轻点不会揭晓结果，请按住满 0.9 秒。"
        : "结果已经生成，按住 0.9 秒才会显形。";
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
          className="grid gap-5 rounded-[var(--quiz-radius-panel)] border border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-surface-strong)] p-5 shadow-[0_24px_72px_rgba(1,8,18,0.24)] sm:p-6"
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -16, scale: 0.98 }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
          key="result-gate"
          transition={itemTransition}
        >
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent)]">
              Hold To Reveal
            </p>
            <div className="space-y-3">
              <h2 className="max-w-[14ch] font-[family:var(--font-quiz-display)] text-3xl leading-tight text-[color:var(--quiz-text)] sm:text-4xl">
                第 8 题已落定，现在按住把结果从轨道里拖出来。
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                轻点只会提示操作，不会直接打开结果。完成记录一旦写入本地，再次回到同一链接时会直接进入摘要页。
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <motion.button
                aria-label="按住揭晓测试结果"
                className="group relative flex h-[8.5rem] w-[8.5rem] items-center justify-center rounded-full border border-[color:var(--quiz-border-strong)] bg-[radial-gradient(circle_at_30%_30%,var(--quiz-accent-warm-fill)_0%,rgba(7,18,31,0.94)_72%)] text-[color:var(--quiz-text)] shadow-[0_20px_48px_rgba(1,8,18,0.28)]"
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
                  animate={isPressing ? { opacity: 0.9, scale: 1.04 } : { opacity: 0.55, scale: 1 }}
                  className="absolute inset-4 rounded-full bg-[radial-gradient(circle,var(--quiz-glow-primary)_0%,transparent_74%)]"
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
                />

                <svg aria-hidden className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
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
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent-soft)]">
                    {isPressing ? "Holding" : "Press"}
                  </span>
                  <span className="font-[family:var(--font-quiz-display)] text-2xl leading-none text-[color:var(--quiz-text)]">
                    {isPressing ? "继续" : "按住"}
                  </span>
                  <span className="text-xs text-[color:var(--quiz-muted)]">0.9s 揭晓</span>
                </div>
              </motion.button>
            </div>

            <div className="space-y-3 rounded-[calc(var(--quiz-radius-panel)-0.25rem)] border border-[color:var(--quiz-border-soft)] bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent-soft)]">
                Reveal Guidance
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm leading-7 text-[color:var(--quiz-text)]"
                  exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  key={hintState}
                  transition={itemTransition}
                >
                  {hintCopy}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs leading-6 text-[color:var(--quiz-muted)]">
                结果已经写入当前设备的本地记录，所以重新打开同一链接时会直接看到摘要，不会再次要求长按。
              </p>
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
            className="grid max-w-3xl gap-4 rounded-[var(--quiz-radius-panel)] border border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-surface-strong)] p-5 shadow-[0_28px_80px_rgba(1,8,18,0.28)] sm:p-6"
            data-testid="quiz-result-card"
            initial="hidden"
            variants={sectionVariants}
          >
            <motion.div className="flex flex-wrap items-start justify-between gap-4" variants={itemVariants}>
              <div>
                <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent-soft)]">
                  Saved Result Summary
                </p>
                <h2 className="mt-3 font-[family:var(--font-quiz-display)] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl">
                  {attempt.summary.mbtiType}
                </h2>
                <p className="mt-3 text-lg font-semibold text-[color:var(--quiz-text)] sm:text-2xl">
                  {attempt.summary.result.title}
                </p>
              </div>

              <span className="rounded-full border border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-accent-soft-fill)] px-3 py-1 text-xs text-[color:var(--quiz-text)]">
                已保存 · {formatTimestamp(attempt.completedAt)}
              </span>
            </motion.div>

            <motion.p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base" variants={itemVariants}>
              {attempt.summary.result.description}
            </motion.p>

            <motion.div className="flex flex-wrap gap-2" variants={itemVariants}>
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

            <motion.div
              className="rounded-[calc(var(--quiz-radius-panel)-0.25rem)] border border-dashed border-[color:var(--quiz-border-soft)] bg-black/10 p-4"
              variants={itemVariants}
            >
              <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent)]">
                Closing Copy
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-text)] sm:text-base">
                {attempt.summary.result.closing}
              </p>
            </motion.div>
          </motion.div>

          <motion.button
            className="flex w-full items-center justify-center gap-2 rounded-[var(--quiz-radius-button)] border border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-accent)] px-4 py-3 font-semibold text-[color:var(--quiz-surface-strong)] transition-colors hover:bg-[color:var(--quiz-accent-hover)] active:scale-[0.98]"
            data-testid="export-image-button"
            disabled={isExporting}
            onClick={handleExportImage}
            type="button"
            variants={itemVariants}
          >
            {isExporting ? (
              <span>导出中...</span>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>保存为图片</span>
              </>
            )}
          </motion.button>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
