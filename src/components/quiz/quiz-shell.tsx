"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { QuizBackground } from "@/src/components/quiz/quiz-background";
import { QuizFlow } from "@/src/components/quiz/quiz-flow";
import { QuizResultScreen } from "@/src/components/quiz/quiz-result-screen";
import type { QuizDefinition } from "@/src/lib/config";
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
  "inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold tracking-[0.08em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--quiz-accent)]";
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

function getStateTag(shellState: ShellState) {
  switch (shellState.kind) {
    case "intro":
      return "准备开启";
    case "in-progress":
      return "继续作答";
    case "summary":
      return "结果归档";
    case "expired":
      return "链接过期";
    case "storage-unavailable":
      return "存储受限";
    case "unknown-slug":
      return "未知旅程";
  }
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

  return <span className={`rounded-full border px-3 py-1 text-xs ${toneClassName}`}>{children}</span>;
}

function ShellStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="atlas-panel rounded-[1.15rem] p-4">
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-muted)]">{label}</p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--quiz-text)]">{value}</p>
      </div>
    </div>
  );
}

function ShellCard({ children }: { children: ReactNode }) {
  return (
    <div className="atlas-panel rounded-[var(--quiz-radius-panel)] p-4 sm:p-5">
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

function ShellLink({ children, href, secondary = false }: { children: ReactNode; href: string; secondary?: boolean }) {
  return (
    <Link
      className={`${actionClassName} ${
        secondary
          ? "ghost-button"
          : "metal-button hover:-translate-y-0.5"
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}

export function QuizShell({ availableSlugs, disclaimer, expireAt, quiz, slug, tieBreaker, token }: QuizShellProps) {
  const prefersReducedMotion = useReducedMotion();
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

  const shellState = clientShellState ?? initialShellState;
  const contentInitial = prefersReducedMotion ? false : { opacity: 0, y: 18 };
  const contentAnimate = { opacity: 1, y: 0 };
  const contentExit = prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 };
  const contentTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" as const };

  const routeToken = token?.trim() ? token : "default";
  const flowProgressLabel = flowProgress ? `${flowProgress.activeQuestionIndex + 1} / ${flowProgress.totalQuestions}` : null;
  const progressLabel =
    flowProgressLabel ??
    (shellState.kind === "summary"
      ? "已完成"
      : shellState.kind === "in-progress"
        ? `${shellState.nextQuestionIndex + 1} / ${quiz?.questions.length ?? 0}`
        : shellState.kind === "expired"
          ? "已截止"
          : shellState.kind === "storage-unavailable"
            ? "不可保存"
            : shellState.kind === "unknown-slug"
              ? "无匹配配置"
              : "待开始");
  const stateTag = flowProgress ? "单题作答" : getStateTag(shellState);

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
        { label: "当前请求", value: slug },
        { label: "可用旅程", value: `${availableSlugs.length} 个` },
        { label: "路由状态", value: "等待有效 slug" },
      ];

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(180deg,var(--quiz-bg-deep)_0%,var(--quiz-bg-mid)_56%,var(--quiz-bg-soft)_100%)] text-[color:var(--quiz-text)]">
      <QuizBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[var(--quiz-shell-max)] items-center px-3 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="atlas-shell relative w-full rounded-[var(--quiz-radius-shell)]">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.08fr)_21rem] lg:p-8">
            <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
              <header className="flex flex-col gap-4 border-b border-[color:var(--quiz-border-soft)]/90 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-3">
                  <ShellEyebrow>星图手记</ShellEyebrow>
                  <div className="space-y-2">
                    <h1 className="editorial-title text-3xl leading-tight text-[color:var(--quiz-text)] sm:text-[2.7rem]">
                      同一套星图里的一段问答航线。
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                      这一页会沿着同一张星图继续展开：层次更稳定，状态更清楚，从进入、作答到揭晓都保持连贯的节奏。
                    </p>
                  </div>
                </div>

                <ShellLink href="/" secondary>
                  返回首页
                </ShellLink>
              </header>

              <div className="flex flex-wrap items-center gap-3">
                <ShellPill tone="accent">{stateTag}</ShellPill>
                <ShellPill>slug · {slug}</ShellPill>
                <ShellPill tone="cool">token · {routeToken}</ShellPill>
              </div>

              <AnimatePresence initial={false} mode="wait">
                <motion.section
                  animate={contentAnimate}
                  className="space-y-6"
                  exit={contentExit}
                  initial={contentInitial}
                  key={`${shellState.kind}-${slug}-${isFlowActive ? "flow" : "panel"}`}
                  transition={contentTransition}
                >
                  {shellState.kind === "unknown-slug" ? (
                    <>
                      <div className="space-y-4">
                        <ShellEyebrow>未知航线</ShellEyebrow>
                        <h2 className="editorial-title max-w-[12ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          这段旅程暂时还没有落到星图里。
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          你打开的是 <span className="text-[color:var(--quiz-accent)]">{slug}</span>，但当前目录里还没有对应内容。
                          外壳已经留好位置，后续接入新主题时能直接沿用这一套版式与节奏。
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {introCards.map((item) => (
                          <ShellStat key={item.label} label={item.label} value={item.value} />
                        ))}
                      </div>

                      <ShellCard>
                        <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                          先回到已经可用的入口，等这段旅程接入完成后，再从同一路径重新进入。
                        </p>
                      </ShellCard>

                      <div className="flex flex-wrap gap-3">
                        <ShellLink href={availableSlugs[0] ? `/quiz/${availableSlugs[0]}` : "/"}>打开可用旅程</ShellLink>
                        <ShellLink href="/" secondary>
                          返回首页
                        </ShellLink>
                      </div>
                    </>
                  ) : shellState.kind === "expired" ? (
                    <>
                      <div className="space-y-4">
                        <ShellEyebrow>已结束链接</ShellEyebrow>
                        <h2 className="editorial-title max-w-[11ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          这条旅程链接已经结束航行。
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          新作答已关闭。
                          {quiz ? ` ${quiz.title} 的外壳仍然完整保留，后续只需接上题目流与结果页即可。` : ""}
                          {quiz && shellState.attempt
                            ? ` 当前设备曾保存 ${getAnsweredQuestionCount(quiz, shellState.attempt.answers)} 道题的进度，但未完成结果摘要。`
                            : ""}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <ShellStat label="状态" value="不可再开始" />
                        <ShellStat label="截止时间" value={formatExpireAt(shellState.expireAt)} />
                        <ShellStat label="当前状态" value="已结束访问" />
                      </div>

                      <ShellCard>
                        <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                          如果你已经完成过这段旅程，再次回到同一链接时会直接看到结果；只有中途停下且链接过期时，才会来到这里。
                        </p>
                      </ShellCard>

                      <div className="flex flex-wrap gap-3">
                        <ShellLink href={quiz ? `/quiz/${quiz.slug}` : "/"}>回到可用入口</ShellLink>
                        <ShellLink href="/" secondary>
                          返回首页
                        </ShellLink>
                      </div>
                    </>
                  ) : shellState.kind === "storage-unavailable" ? (
                    <>
                      <div className="space-y-4">
                        <ShellEyebrow>存储受限</ShellEyebrow>
                        <h2 className="editorial-title max-w-[11ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          当前浏览器无法保存这段旅程。
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          当前页面不会直接中断。你仍然能看见完整外壳，但续答和结果回访需要可用的 `localStorage` 才能生效。
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <ShellStat label="恢复方式" value="开启浏览器存储" />
                        <ShellStat label="回访能力" value="暂不可用" />
                        <ShellStat label="当前状态" value="暂时无法继续" />
                      </div>

                      <ShellCard>
                        <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                          常见原因包括隐私模式拦截、浏览器禁用站点数据，或当前环境不允许写入本地记录。
                        </p>
                      </ShellCard>

                      <div className="flex flex-wrap gap-3">
                        <ShellLink href={quiz ? `/quiz/${quiz.slug}` : "/"}>刷新可用环境后重试</ShellLink>
                        <ShellLink href="/" secondary>
                          返回首页
                        </ShellLink>
                      </div>
                    </>
                  ) : shellState.kind === "summary" ? (
                    <>
                      <div className="space-y-4">
                        <ShellEyebrow>已保存终点</ShellEyebrow>
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
                      />

                      <div className="flex flex-wrap gap-3">
                        <ShellLink href="/" secondary>
                          返回首页
                        </ShellLink>
                      </div>
                    </>
                  ) : shellState.kind === "in-progress" ? (
                    <>
                      <div className="space-y-4">
                        <ShellEyebrow>已恢复进度</ShellEyebrow>
                        <h2 className="editorial-title max-w-[12ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          你的轨迹已经恢复到第 {shellState.nextQuestionIndex + 1} 题。
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          中断进度会直接落回下一道未答题，不用重新翻页，也不会把已完成的选择再展示成整屏列表。
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <ShellStat label="已答题目" value={`${shellState.answeredCount} / ${quiz?.questions.length ?? 0}`} />
                        <ShellStat label="下一题" value={shellState.nextQuestionId ?? "待接线"} />
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
                        tieBreaker={tieBreaker}
                        token={shellState.token}
                      />

                      <div className="flex flex-wrap gap-3">
                        <ShellLink href="/" secondary>
                          返回首页
                        </ShellLink>
                      </div>
                    </>
                  ) : (
                    <>
                      {!isFlowActive ? (
                        <>
                          <div className="space-y-4">
                            <ShellEyebrow>{quiz?.theme ?? "问答"} 旅程</ShellEyebrow>
                            <h2 className="editorial-title max-w-[12ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                              {quiz?.title}
                            </h2>
                            <p className="text-base font-medium text-[color:var(--quiz-accent-soft)] sm:text-lg">{quiz?.subtitle}</p>
                            <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">{quiz?.intro}</p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            {introCards.map((item) => (
                              <ShellStat key={item.label} label={item.label} value={item.value} />
                            ))}
                          </div>

                          <ShellCard>
                            <div className="grid gap-4 sm:grid-cols-3">
                              <div>
                                <p className="detail-label text-[11px] text-[color:var(--quiz-accent)]">01 校准航向</p>
                                <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-muted)]">
                                  先看清这次旅程的主题，再让眼前的第一道题慢慢亮起来。
                                </p>
                              </div>
                              <div>
                                <p className="detail-label text-[11px] text-[color:var(--quiz-accent-soft)]">02 跟着直觉作答</p>
                                <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-muted)]">
                                  每次选择都会立即记下，并用轻量过渡把你送往下一段轨道。
                                </p>
                              </div>
                              <div>
                                <p className="detail-label text-[11px] text-[color:var(--quiz-accent)]">03 揭晓归属</p>
                                <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-muted)]">
                                  答完整段旅程后，结果会先停在星图表面，再由你亲手揭开。
                                </p>
                              </div>
                            </div>
                          </ShellCard>

                          <div className="flex flex-wrap gap-3">
                            <ShellPrimaryButton disabled={false} onClick={() => setIsFlowActive(true)}>
                              开始旅程
                            </ShellPrimaryButton>
                            <ShellLink href="/" secondary>
                              返回首页
                            </ShellLink>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <ShellEyebrow>正在航行</ShellEyebrow>
                            <h2 className="editorial-title max-w-[12ch] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                              现在开始，把直觉落到一题一题的轨道里。
                            </h2>
                            <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                              一次只看一题，让节奏干净地向前推进。你刚刚做出的选择，会悄悄把下一张题卡推到眼前。
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
                            tieBreaker={tieBreaker}
                            token={shellState.token}
                          />

                          <div className="flex flex-wrap gap-3">
                            <ShellLink href="/" secondary>
                              返回首页
                            </ShellLink>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </motion.section>
              </AnimatePresence>
            </div>

            <aside className="atlas-panel flex min-w-0 flex-col gap-4 rounded-[var(--quiz-radius-panel)] p-4 sm:p-5">
              <div className="relative z-10 space-y-4">
                <div className="space-y-3">
                  <ShellEyebrow>航线侧记</ShellEyebrow>
                  <h2 className="editorial-title text-3xl leading-tight text-[color:var(--quiz-text)]">
                    一段为指尖和夜空准备好的问答旅程。
                  </h2>
                  <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                    入口、问题流与结果摘要都保持同一条版式线索，让整个体验在手机和桌面上都能稳定推进。
                  </p>
                </div>

                <div className="rounded-[1.2rem] border border-[color:var(--quiz-border-soft)] bg-[rgba(240,232,215,0.03)] p-4">
                  <svg aria-hidden className="h-auto w-full text-[color:var(--quiz-accent)]" viewBox="0 0 220 180">
                    <title>Route chart</title>
                    <circle cx="110" cy="90" fill="none" opacity="0.36" r="62" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="110" cy="90" fill="none" opacity="0.16" r="38" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M38 94L76 70L116 98L160 58L188 84" fill="none" opacity="0.45" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M110 24V156M36 90H184" opacity="0.22" stroke="currentColor" strokeDasharray="4 8" strokeWidth="1.1" />
                    <circle cx="38" cy="94" fill="currentColor" r="2.5" />
                    <circle cx="76" cy="70" fill="currentColor" r="2.5" />
                    <circle cx="116" cy="98" fill="currentColor" r="2.5" />
                    <circle cx="160" cy="58" fill="currentColor" r="2.5" />
                    <circle cx="188" cy="84" fill="currentColor" r="2.5" />
                  </svg>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <ShellStat label="当前状态" value={progressLabel} />
                  <ShellStat label="链接截止" value={formatExpireAt(expireAt)} />
                  <ShellStat label="本地回访" value="同设备优先恢复" />
                  <ShellStat label="当前主题" value={quiz?.theme ?? "待接入"} />
                </div>

                <ShellCard>
                  <p className="detail-label text-[11px] text-[color:var(--quiz-accent)]">体验边界</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-muted)]">
                    动效只循环 `transform` 与 `opacity`，背景使用低频率的星图漂移和光雾层，并在系统偏好降低动态效果时停止非必要循环。
                  </p>
                </ShellCard>

                <ShellCard>
                  <p className="detail-label text-[11px] text-[color:var(--quiz-accent-soft)]">说明</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-muted)]">{disclaimer}</p>
                </ShellCard>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
