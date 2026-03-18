"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { QuizDefinition } from "@/src/lib/config";
import { applyQuizAnswer, createQuizFlowProgress, type QuizFlowProgress } from "@/src/lib/quiz-flow-state";
import type { QuizAnswers } from "@/src/lib/quiz-engine";
import { createQuizAttemptStorage, type QuizAttemptRecord } from "@/src/lib/storage";

type CompletedAttempt = QuizAttemptRecord & {
  completedAt: string;
  summary: NonNullable<QuizAttemptRecord["summary"]>;
};

type QuizFlowProps = {
  quiz: QuizDefinition;
  slug: string;
  token: string | null;
  expireAt: number | null;
  tieBreaker: readonly string[];
  initialAnswers: QuizAnswers;
  initialQuestionIndex: number;
  isResume: boolean;
  onComplete: (attempt: CompletedAttempt) => void;
  onProgress: (progress: QuizFlowProgress) => void;
  onStorageUnavailable: () => void;
};

const ADVANCE_DELAY_MS = 420;

function getProgressRatio(progress: QuizFlowProgress) {
  if (progress.totalQuestions <= 0) {
    return 0;
  }

  return (progress.activeQuestionIndex + 1) / progress.totalQuestions;
}

export function QuizFlow({
  quiz,
  slug,
  token,
  expireAt,
  tieBreaker,
  initialAnswers,
  initialQuestionIndex,
  isResume,
  onComplete,
  onProgress,
  onStorageUnavailable,
}: QuizFlowProps) {
  const prefersReducedMotion = useReducedMotion();
  const storage = useMemo(() => createQuizAttemptStorage(), []);
  const initialProgress = useMemo(
    () => createQuizFlowProgress(quiz, initialAnswers, initialQuestionIndex),
    [initialAnswers, initialQuestionIndex, quiz],
  );
  const timeoutRef = useRef<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers>(() => ({ ...initialAnswers }));
  const [progress, setProgress] = useState(initialProgress);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const currentQuestion = quiz.questions[progress.activeQuestionIndex] ?? null;
  const progressRatio = getProgressRatio(progress);
  const transitionDuration = prefersReducedMotion ? 0 : 0.38;
  const feedbackDelay = prefersReducedMotion ? 0 : ADVANCE_DELAY_MS;

  useEffect(() => {
    onProgress(initialProgress);
  }, [initialProgress, onProgress]);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  if (!currentQuestion) {
    return null;
  }

  function clearPendingAdvance() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function handleStorageFailure() {
    clearPendingAdvance();
    setIsAdvancing(false);
    setSelectedAnswerId(null);
    onStorageUnavailable();
  }

  function scheduleAdvance(callback: () => void) {
    clearPendingAdvance();
    timeoutRef.current = window.setTimeout(() => {
      callback();
      timeoutRef.current = null;
    }, feedbackDelay);
  }

  function handleSelectAnswer(answerId: string) {
    if (isAdvancing) {
      return;
    }

    setSelectedAnswerId(answerId);
    setIsAdvancing(true);

    const nextState = applyQuizAnswer(quiz, answers, progress.activeQuestionIndex, answerId, tieBreaker);
    setAnswers(nextState.answers);
    onProgress(nextState.progress);

    if (nextState.kind === "complete") {
      const completedAttemptRecord = storage.writeCompletion({
        quiz,
        slug,
        token,
        expireAt,
        answers: nextState.answers,
        score: nextState.score,
      });

      if (!completedAttemptRecord?.completedAt || !completedAttemptRecord.summary) {
        handleStorageFailure();
        return;
      }

      const completedAttempt: CompletedAttempt = {
        ...completedAttemptRecord,
        completedAt: completedAttemptRecord.completedAt,
        summary: completedAttemptRecord.summary,
      };

      scheduleAdvance(() => {
        onComplete(completedAttempt);
      });
      return;
    }

    const progressAttempt = storage.writeProgress({
      quiz,
      slug,
      token,
      expireAt,
      answers: nextState.answers,
    });

    if (!progressAttempt) {
      handleStorageFailure();
      return;
    }

    scheduleAdvance(() => {
      setProgress(nextState.progress);
      setSelectedAnswerId(null);
      setIsAdvancing(false);
    });
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-[var(--quiz-radius-panel)] border border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-panel)] p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent)]">
              {isResume ? "Recovered Orbit" : "Question Flow"}
            </p>
            <div>
              <h2 className="font-[family:var(--font-quiz-display)] text-2xl leading-tight text-[color:var(--quiz-text)] sm:text-3xl">
                第 {progress.activeQuestionIndex + 1} 题
              </h2>
              <p className="mt-1 text-sm leading-7 text-[color:var(--quiz-muted)]">
                {isResume && progress.answeredCount > 0
                  ? "已从上次停下的位置继续，答案会实时保存在当前浏览器。"
                  : "每次选择都会立即保存，并在短暂反馈后切换到下一题。"}
              </p>
            </div>
          </div>

          <div className="rounded-full border border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-accent-warm-fill)] px-4 py-2 text-sm font-semibold text-[color:var(--quiz-text)]">
            {progress.activeQuestionIndex + 1} / {progress.totalQuestions}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-muted)]">
            <span>轨道进度</span>
            <span>已记录 {progress.answeredCount} 题</span>
          </div>

          <div className="overflow-hidden rounded-full bg-[color:var(--quiz-border-soft)]/60 p-1">
            <div className="h-2 rounded-full bg-[color:var(--quiz-surface-strong)]">
              <motion.div
                animate={{ scaleX: progressRatio }}
                className="h-full origin-left rounded-full bg-[linear-gradient(90deg,var(--quiz-accent-soft)_0%,var(--quiz-accent)_100%)] shadow-[0_0_24px_var(--quiz-glow-primary)]"
                initial={false}
                transition={{ duration: transitionDuration, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-8 gap-2">
            {quiz.questions.map((question, index) => {
              const isCurrent = index === progress.activeQuestionIndex;
              const isAnswered = index < progress.activeQuestionIndex;

              return (
                <span
                  className={`h-1.5 rounded-full transition duration-300 ${
                    isCurrent
                      ? "bg-[color:var(--quiz-accent)] shadow-[0_0_20px_var(--quiz-glow-primary)]"
                      : isAnswered
                        ? "bg-[color:var(--quiz-accent-soft)]"
                        : "bg-[color:var(--quiz-border-soft)]"
                  }`}
                  key={question.id}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative min-h-[28rem] sm:min-h-[30rem]">
        <AnimatePresence initial={false} mode="wait">
          <motion.article
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="relative overflow-hidden rounded-[var(--quiz-radius-panel)] border border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-panel)] p-5 shadow-[0_24px_72px_rgba(1,8,18,0.22)] sm:p-6"
            exit={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -28, scale: 0.98 }}
            initial={prefersReducedMotion ? false : { opacity: 0, x: 32, scale: 0.98 }}
            key={currentQuestion.id}
            transition={{ duration: transitionDuration, ease: "easeOut" }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--quiz-line-shine),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--quiz-glow-primary)_0%,transparent_46%),radial-gradient(circle_at_bottom_left,var(--quiz-glow-secondary)_0%,transparent_42%)] opacity-80" />

            <div className="relative space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-surface-strong)] px-3 py-1 text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent-soft)]">
                  {quiz.theme} · {currentQuestion.dimension}
                </span>
                <span className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-muted)]">
                  {isAdvancing ? "正在记录选择" : "选择后自动进入下一题"}
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent)]">
                  {currentQuestion.id}
                </p>
                <h3 className="max-w-[16ch] font-[family:var(--font-quiz-display)] text-3xl leading-tight text-[color:var(--quiz-text)] sm:text-[2.5rem]">
                  {currentQuestion.text}
                </h3>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswerId === option.id;

                  return (
                    <motion.button
                      animate={isSelected ? { scale: 1.01 } : { scale: 1 }}
                      className={`group relative flex w-full items-start gap-4 overflow-hidden rounded-[calc(var(--quiz-radius-panel)-0.375rem)] border px-4 py-4 text-left transition duration-300 sm:px-5 sm:py-5 ${
                        isSelected
                          ? "border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-accent-warm-fill)] text-[color:var(--quiz-text)] shadow-[0_18px_48px_rgba(1,8,18,0.18)]"
                          : "border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-surface)] text-[color:var(--quiz-text)] hover:border-[color:var(--quiz-border-strong)] hover:bg-[color:var(--quiz-surface-strong)]"
                      }`}
                      disabled={isAdvancing}
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.id)}
                      transition={{ duration: transitionDuration, ease: "easeOut" }}
                      type="button"
                      whileHover={prefersReducedMotion || isAdvancing ? undefined : { y: -2, scale: 1.01 }}
                      whileTap={prefersReducedMotion || isAdvancing ? undefined : { scale: 0.985 }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--quiz-accent-warm-fill)_0%,transparent_68%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                      <span
                        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition duration-300 ${
                          isSelected
                            ? "border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-accent)] text-slate-950"
                            : "border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-panel)] text-[color:var(--quiz-accent-soft)]"
                        }`}
                      >
                        {option.id}
                      </span>

                      <div className="relative min-w-0 flex-1">
                        <p className="text-base font-semibold leading-7 text-[color:var(--quiz-text)] sm:text-lg">{option.text}</p>
                        <p className="mt-2 text-xs leading-6 text-[color:var(--quiz-muted)]">
                          {isSelected ? "答案已锁定，准备切换到下一题。" : `点击选择这个方向（选项 ${index + 1}）。`}
                        </p>
                      </div>

                      <span
                        className={`relative rounded-full border px-3 py-1 text-xs transition duration-300 ${
                          isSelected
                            ? "border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-accent-soft-fill)] text-[color:var(--quiz-text)]"
                            : "border-[color:var(--quiz-border-soft)] text-[color:var(--quiz-muted)]"
                        }`}
                      >
                        {isSelected ? "已选择" : "待选择"}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="rounded-[calc(var(--quiz-radius-panel)-0.5rem)] border border-dashed border-[color:var(--quiz-border-soft)] bg-black/10 px-4 py-3 text-sm leading-7 text-[color:var(--quiz-muted)]">
                题目与选项全部来自配置，当前进度会在同一浏览器中自动续接到下一题。
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
