"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { QuizBackground } from "@/src/components/quiz/quiz-background";
import { QuizFlow } from "@/src/components/quiz/quiz-flow";
import { QuizResultScreen } from "@/src/components/quiz/quiz-result-screen";
import { getQuizExperienceTheme } from "@/src/components/quiz/quiz-theme";
import type { QuizDefinition } from "@/src/lib/config";
import { isShareTokenValid } from "@/src/lib/share/share-link";
import type { QuizAnswers } from "@/src/lib/quiz-engine";
import type { QuizFlowProgress } from "@/src/lib/quiz-flow-state";
import { getAnsweredQuestionCount } from "@/src/lib/storage";
import {
  isQuizLinkExpired,
  resolveQuizRouteState,
  type QuizRouteState,
} from "@/src/lib/state";

type QuizShellProps = {
  availableSlugs: string[];
  disclaimer: string;
  expireAt: number | null;
  quiz: QuizDefinition | null;
  slug: string;
  tieBreaker: readonly string[];
  token: string | null;
};

type UnknownSlugShellState = {
  kind: "unknown-slug";
  slug: string;
};

type ShellState = QuizRouteState | UnknownSlugShellState;

const actionClassName =
  "quiz-action inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold tracking-[0.08em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--quiz-accent)]";
const EMPTY_INITIAL_ANSWERS: QuizAnswers = {};

function formatExpireAt(expireAt: number | null) {
  if (expireAt === null) {
    return "未设置";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(expireAt);
}

function buildShellState(
  quiz: QuizDefinition | null,
  slug: string,
  token: string | null,
  expireAt: number | null,
) {
  if (!quiz) {
    return {
      kind: "unknown-slug",
      slug,
    } satisfies UnknownSlugShellState;
  }

  if (!token || !isShareTokenValid(token) || expireAt === null) {
    return {
      kind: "expired",
      slug,
      token,
      expireAt,
      attempt: null,
    } satisfies QuizRouteState;
  }

  if (isQuizLinkExpired(expireAt)) {
    return {
      kind: "expired",
      slug,
      token,
      expireAt,
      attempt: null,
    } satisfies QuizRouteState;
  }

  return {
    kind: "intro",
    slug,
    token,
    expireAt,
  } satisfies QuizRouteState;
}

function ShellEyebrow({ children }: { children: ReactNode }) {
  return <p className="detail-label text-[11px] text-[color:var(--quiz-accent)]">{children}</p>;
}

function ShellPill({ children, tone = "muted" }: { children: ReactNode; tone?: "accent" | "muted" | "cool" }) {
  const toneClassName =
    tone === "accent"
      ? "border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-accent-warm-fill)] text-[color:var(--quiz-accent)]"
      : tone === "cool"
        ? "border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-accent-soft-fill)] text-[color:var(--quiz-text)]"
        : "border-[color:var(--quiz-border-soft)] bg-[rgba(240,232,215,0.03)] text-[color:var(--quiz-muted)]";

  return <span className={`quiz-shell-pill rounded-full border px-3 py-1 text-xs ${toneClassName}`}>{children}</span>;
}

function ShellStat({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={`quiz-stat-card rounded-[1.15rem] p-4 ${className}`}>
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-muted)]">{label}</p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--quiz-text)]">{value}</p>
      </div>
    </div>
  );
}

function ShellCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`quiz-note-card rounded-[var(--quiz-radius-panel)] p-4 sm:p-5 ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ShellPrimaryButton({
  children,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      aria-disabled={disabled}
      className={`${actionClassName} metal-button ${disabled ? "cursor-not-allowed opacity-90" : "cursor-pointer"}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
      whileHover={prefersReducedMotion || disabled ? undefined : { y: -1, scale: 1.01 }}
      whileTap={prefersReducedMotion || disabled ? undefined : { scale: 0.985 }}
    >
      {children}
    </motion.button>
  );
}

export function QuizShell({ availableSlugs, expireAt, quiz, slug, tieBreaker, token }: QuizShellProps) {
  const prefersReducedMotion = useReducedMotion();
  const quizTheme = useMemo(() => getQuizExperienceTheme(quiz, slug), [quiz, slug]);
  const initialShellState = useMemo(() => buildShellState(quiz, slug, token, expireAt), [quiz, slug, token, expireAt]);
  const [clientShellState, setClientShellState] = useState<ShellState | null>(null);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [flowProgress, setFlowProgress] = useState<QuizFlowProgress | null>(null);
  const [summaryRevealState, setSummaryRevealState] = useState<"gate" | "result">("gate");

  useEffect(() => {
    if (!quiz) {
      setClientShellState({ kind: "unknown-slug", slug });
      return;
    }

    const resolvedRouteState = resolveQuizRouteState({
      expireAt,
      quiz,
      slug,
      token,
    });

    setClientShellState(resolvedRouteState);
    setSummaryRevealState(resolvedRouteState.kind === "summary" ? "result" : "gate");
  }, [expireAt, quiz, slug, token]);

  useEffect(() => {
    document.documentElement.dataset.quizTheme = quizTheme.id;
    document.body.dataset.quizTheme = quizTheme.id;

    return () => {
      if (document.documentElement.dataset.quizTheme === quizTheme.id) {
        delete document.documentElement.dataset.quizTheme;
      }

      if (document.body.dataset.quizTheme === quizTheme.id) {
        delete document.body.dataset.quizTheme;
      }
    };
  }, [quizTheme.id]);

  const shellState = clientShellState ?? initialShellState;
  const contentInitial = prefersReducedMotion ? false : { opacity: 0, y: 18 };
  const contentAnimate = { opacity: 1, y: 0 };
  const contentExit = prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 };
  const contentTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" as const };

  useEffect(() => {
    if (shellState.kind === "in-progress") {
      setIsFlowActive(true);
      return;
    }

    if (shellState.kind !== "intro") {
      setIsFlowActive(false);
      setFlowProgress(null);
    }
  }, [shellState.kind]);

  function handleFlowStorageUnavailable() {
    if (shellState.kind === "unknown-slug") {
      return;
    }

    setClientShellState({
      kind: "storage-unavailable",
      slug,
      token: shellState.token,
      expireAt: shellState.expireAt,
    });
    setIsFlowActive(false);
    setFlowProgress(null);
  }

  function handleFlowComplete(attempt: Extract<QuizRouteState, { kind: "summary" }>["attempt"]) {
    setSummaryRevealState("gate");
    setClientShellState({
      kind: "summary",
      slug: attempt.slug,
      token: attempt.token,
      expireAt: attempt.expireAt,
      attempt,
    });
    setIsFlowActive(false);
    setFlowProgress(null);
  }

  const introCards = quiz
    ? [
        { label: "题目长度", value: `${quiz.questions.length} 道双选题` },
        { label: "结果数量", value: `${quiz.results.length} 个结果落点` },
        { label: "回访规则", value: "同设备完成后直达摘要" },
      ]
    : [
        { label: "当前状态", value: "未找到对应旅程" },
        { label: "可用旅程", value: `${availableSlugs.length} 个` },
        { label: "下一步", value: "回到分享入口获取新链接" },
      ];

  return (
    <main
      className="quiz-theme-root relative isolate min-h-screen overflow-hidden bg-[linear-gradient(180deg,var(--quiz-bg-deep)_0%,var(--quiz-bg-mid)_56%,var(--quiz-bg-soft)_100%)] text-[color:var(--quiz-text)]"
      data-quiz-theme={quizTheme.id}
      data-quiz-visual-family={quizTheme.visualFamily}
    >
      <QuizBackground themeId={quizTheme.id} />

      <div className="quiz-shell-viewport relative mx-auto flex min-h-screen w-full max-w-[var(--quiz-shell-max)] items-center px-3 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="quiz-shell-frame relative w-full rounded-[var(--quiz-radius-shell)]">
          <div className="quiz-shell-grid grid gap-6 p-5 sm:p-7 lg:p-8">
            <div className="quiz-shell-main flex min-w-0 flex-col gap-6 sm:gap-8">
              <header className="quiz-shell-header flex flex-col items-center gap-4 pb-5 text-center">
                <div className="quiz-shell-title-group mx-auto w-full max-w-3xl space-y-3 text-center">
                  <ShellEyebrow>{quizTheme.routeLabel}</ShellEyebrow>
                  <div className="space-y-2">
                    <h1 className="editorial-title mx-auto max-w-[18ch] text-3xl leading-tight text-[color:var(--quiz-text)] sm:text-[2.7rem]">
                      {quizTheme.shellTitle}
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                      {quizTheme.shellDescription}
                    </p>
                  </div>
                </div>
              </header>

              <AnimatePresence initial={false} mode="wait">
                <motion.section
                  animate={contentAnimate}
                  className="quiz-stage space-y-6"
                  data-quiz-stage={shellState.kind}
                  exit={contentExit}
                  initial={contentInitial}
                  key={`${shellState.kind}-${slug}-${isFlowActive ? "flow" : "panel"}`}
                  transition={contentTransition}
                >
                  {shellState.kind === "unknown-slug" ? (
                    <>
                      <div className="quiz-stage-hero space-y-4">
                        <ShellEyebrow>未知航线</ShellEyebrow>
                        <h2 className="editorial-title max-w-[12ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          这段旅程暂时还没有落到星图里。
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          当前链接没有对应到可访问的旅程内容。请回到分享入口，重新生成一条有效链接后再进入。
                        </p>
                      </div>

                      <div className="quiz-stat-grid grid gap-3 sm:grid-cols-3">
                        {introCards.map((item) => (
                          <ShellStat key={item.label} label={item.label} value={item.value} />
                        ))}
                      </div>

                      <ShellCard>
                        <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                          先回到已经可用的入口，等这段旅程接入完成后，再从同一路径重新进入。
                        </p>
                      </ShellCard>

                    </>
                  ) : shellState.kind === "expired" ? (
                    <>
                      <div className="quiz-stage-hero space-y-4">
                        <ShellEyebrow>已结束链接</ShellEyebrow>
                        <h2 className="editorial-title max-w-[11ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          这条旅程链接已经结束航行。
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          这条分享链接已经失效，当前不能继续作答或查看结果。
                          {quiz && shellState.attempt
                            ? ` 当前设备曾保存 ${getAnsweredQuestionCount(quiz, shellState.attempt.answers)} 道题的进度，但需要重新获取一条有效分享链接后才能继续。`
                            : ""}
                        </p>
                      </div>

                      <div className="quiz-stat-grid grid gap-3 sm:grid-cols-3">
                        <ShellStat label="状态" value="不可再开始" />
                        <ShellStat label="截止时间" value={formatExpireAt(shellState.expireAt)} />
                        <ShellStat label="当前状态" value="已结束访问" />
                      </div>

                      <ShellCard>
                        <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                          如果你还想继续这段旅程，请回到分享入口重新生成一条有效链接，再从新链接进入。
                        </p>
                      </ShellCard>
                    </>
                  ) : shellState.kind === "storage-unavailable" ? (
                    <>
                      <div className="quiz-stage-hero space-y-4">
                        <ShellEyebrow>存储受限</ShellEyebrow>
                        <h2 className="editorial-title max-w-[11ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          当前浏览器无法保存这段旅程。
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          当前页面不会直接中断。你仍然能看见完整外壳，但续答和结果回访需要可用的 `localStorage` 才能生效。
                        </p>
                      </div>

                      <div className="quiz-stat-grid grid gap-3 sm:grid-cols-3">
                        <ShellStat label="恢复方式" value="开启浏览器存储" />
                        <ShellStat label="回访能力" value="暂不可用" />
                        <ShellStat label="当前状态" value="暂时无法继续" />
                      </div>

                      <ShellCard>
                        <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                          常见原因包括隐私模式拦截、浏览器禁用站点数据，或当前环境不允许写入本地记录。
                        </p>
                      </ShellCard>
                    </>
                  ) : shellState.kind === "summary" ? (
                    <>
                      <div className="quiz-stage-hero space-y-4">
                        <ShellEyebrow>{quizTheme.result.summaryLabel}</ShellEyebrow>
                        <h2 className="editorial-title max-w-[12ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          你的最终落点已经被这一台设备记住了。
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          新完成的旅程会先经过一次长按揭晓，再展开完整摘要；已完成链接回访时则会直接回到这张结果页。
                        </p>
                      </div>

                      <QuizResultScreen
                        attempt={shellState.attempt}
                        onReveal={() => setSummaryRevealState("result")}
                        revealState={summaryRevealState}
                        theme={quizTheme}
                      />
                    </>
                  ) : shellState.kind === "in-progress" ? (
                    <>
                      <div className="quiz-stage-hero space-y-4">
                        <ShellEyebrow>已恢复进度</ShellEyebrow>
                        <h2 className="editorial-title max-w-[12ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          你的轨迹已经恢复到第 {shellState.nextQuestionIndex + 1} 题。
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          中断进度会直接落回下一道未答题，不用重新翻页，也不会把已完成的选择再展示成整屏列表。
                        </p>
                      </div>

                      <div className="quiz-stat-grid grid gap-3 sm:grid-cols-3">
                        <ShellStat label="已答题目" value={`${shellState.answeredCount} / ${quiz?.questions.length ?? 0}`} />
                        <ShellStat label="下一步" value="继续当前进度" />
                        <ShellStat label="回访模式" value="继续未完成进度" />
                      </div>

                      <QuizFlow
                        expireAt={shellState.expireAt}
                        initialAnswers={shellState.attempt.answers}
                        initialQuestionIndex={shellState.nextQuestionIndex}
                        isResume
                        key={`resume-${slug}-${shellState.nextQuestionId ?? shellState.nextQuestionIndex}`}
                        onComplete={handleFlowComplete}
                        onProgress={setFlowProgress}
                        onStorageUnavailable={handleFlowStorageUnavailable}
                        quiz={quiz!}
                        slug={slug}
                        theme={quizTheme}
                        tieBreaker={tieBreaker}
                        token={shellState.token}
                      />
                    </>
                  ) : (
                    <>
                        {!isFlowActive ? (
                          <>
                            <div className="quiz-stage-hero space-y-4">
                              <ShellEyebrow>{quiz?.theme ?? "问答"} · {quizTheme.routeLabel}</ShellEyebrow>
                              <h2 className="editorial-title mx-auto max-w-[12ch] text-balance text-center text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                                 {quiz?.title}
                             </h2>
                             <p className="text-center text-base font-medium text-[color:var(--quiz-accent-soft)] sm:text-lg">{quiz?.subtitle}</p>
                             <p className="mx-auto max-w-2xl text-center text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">{quiz?.intro}</p>
                           </div>

                            <div className="quiz-stat-grid grid gap-3 sm:grid-cols-3">
                              {introCards.map((item) => (
                                <ShellStat key={item.label} label={item.label} value={item.value} />
                              ))}
                            </div>

                            <ShellCard className="quiz-intro-card">
                              <div className="quiz-intro-step-grid grid gap-4 sm:grid-cols-3">
                                {quizTheme.introSteps.map((step, index) => (
                                  <div className="quiz-intro-step" key={step.label}>
                                    <p
                                      className={`detail-label text-[11px] ${
                                        index === 1 ? "text-[color:var(--quiz-accent-soft)]" : "text-[color:var(--quiz-accent)]"
                                    }`}
                                  >
                                    {step.label}
                                  </p>
                                  <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-muted)]">{step.description}</p>
                                </div>
                              ))}
                              </div>
                            </ShellCard>

                            <div className="quiz-stage-actions flex flex-wrap justify-center gap-3">
                              <ShellPrimaryButton disabled={false} onClick={() => setIsFlowActive(true)}>
                                开始旅程
                              </ShellPrimaryButton>
                            </div>
                        </>
                        ) : (
                          <>
                            <div className="quiz-stage-hero space-y-4">
                              <ShellEyebrow>{quizTheme.activeLabel}</ShellEyebrow>
                              <h2 className="editorial-title max-w-[12ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                                {quizTheme.activeTitle}
                            </h2>
                            <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                              {quizTheme.activeDescription}
                            </p>
                          </div>

                          <QuizFlow
                            expireAt={expireAt}
                            initialAnswers={EMPTY_INITIAL_ANSWERS}
                            initialQuestionIndex={0}
                            isResume={false}
                            key={`intro-${slug}`}
                            onComplete={handleFlowComplete}
                            onProgress={setFlowProgress}
                            onStorageUnavailable={handleFlowStorageUnavailable}
                            quiz={quiz!}
                            slug={slug}
                            theme={quizTheme}
                            tieBreaker={tieBreaker}
                            token={shellState.token}
                          />
                          </>
                      )}
                    </>
                  )}
                </motion.section>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
