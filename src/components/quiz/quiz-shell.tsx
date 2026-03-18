"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { QuizFlow } from "@/src/components/quiz/quiz-flow";
import { QuizResultScreen } from "@/src/components/quiz/quiz-result-screen";
import type { QuizDefinition } from "@/src/lib/config";
import { QuizBackground } from "@/src/components/quiz/quiz-background";
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
  "inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition duration-300";

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
      return "摘要容器";
    case "expired":
      return "链接过期";
    case "storage-unavailable":
      return "存储受限";
    case "unknown-slug":
      return "未知测试";
  }
}

function ShellEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent)]">
      {children}
    </p>
  );
}

function ShellStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--quiz-radius-panel)] border border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-panel)] p-4">
      <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-muted)]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-[color:var(--quiz-text)]">{value}</p>
    </div>
  );
}

function ShellCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--quiz-radius-panel)] border border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-panel)] p-4 sm:p-5">
      {children}
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
      className={`${actionClassName} border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-accent)] text-slate-950 shadow-lg shadow-black/20 ${
        disabled ? "cursor-not-allowed opacity-90" : "cursor-pointer"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
      whileHover={prefersReducedMotion || disabled ? undefined : { y: -1, scale: 1.01 }}
      whileTap={prefersReducedMotion || disabled ? undefined : { scale: 0.98 }}
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
          ? "border-[color:var(--quiz-border-soft)] bg-transparent text-[color:var(--quiz-text)] hover:border-[color:var(--quiz-border-strong)] hover:bg-[color:var(--quiz-accent-warm-fill)]"
          : "border-transparent bg-[color:var(--quiz-accent)] text-slate-950 hover:translate-y-[-1px]"
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
  const contentInitial = prefersReducedMotion ? false : { opacity: 0, y: 20 };
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

  function handleFlowComplete(attempt: Extract<QuizRouteState, { kind: "summary" }>['attempt']) {
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
        { label: "结果数量", value: `${quiz.results.length} 个星球落点` },
        { label: "回访规则", value: "同设备完成后直达摘要" },
      ]
    : [
        { label: "当前请求", value: slug },
        { label: "可用测试", value: `${availableSlugs.length} 个` },
        { label: "路由状态", value: "等待有效 slug" },
      ];

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(180deg,var(--quiz-bg-deep)_0%,var(--quiz-bg-mid)_54%,var(--quiz-bg-soft)_100%)] text-[color:var(--quiz-text)]">
      <QuizBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[var(--quiz-shell-max)] items-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative w-full overflow-hidden rounded-[var(--quiz-radius-shell)] border border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-surface)] shadow-[var(--quiz-shadow)] backdrop-blur-[var(--quiz-blur-surface)]">
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--quiz-line-shine),transparent)]" />
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.1fr)_20rem] lg:p-8">
            <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-accent-warm-fill)] px-3 py-1 text-xs font-semibold uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent)]">
                  {stateTag}
                </span>
                <span className="rounded-full border border-[color:var(--quiz-border-soft)] px-3 py-1 text-xs text-[color:var(--quiz-muted)]">
                  slug · {slug}
                </span>
                <span className="rounded-full border border-[color:var(--quiz-border-soft)] px-3 py-1 text-xs text-[color:var(--quiz-muted)]">
                  token · {routeToken}
                </span>
              </div>

              <AnimatePresence initial={false} mode="wait">
                <motion.section
                  animate={contentAnimate}
                  className="space-y-6"
                  exit={contentExit}
                  initial={contentInitial}
                  key={`${shellState.kind}-${slug}`}
                  transition={contentTransition}
                >
                  {shellState.kind === "unknown-slug" ? (
                    <>
                      <div className="space-y-4">
                        <ShellEyebrow>Unknown Quiz Route</ShellEyebrow>
                        <h1 className="max-w-[12ch] font-[family:var(--font-quiz-display)] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          这个测试编号暂时还没有落到星图里。
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          你打开的是 <span className="text-[color:var(--quiz-accent)]">{slug}</span>，但当前目录里还没有对应配置。
                          页面仍然保留完整壳层，方便后续继续扩展更多题型主题。
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {introCards.map((item) => (
                          <ShellStat key={item.label} label={item.label} value={item.value} />
                        ))}
                      </div>

                      <ShellCard>
                        <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                          先回到已配置入口，或者在后续任务里把新的 slug 接入共享目录，而不是额外复制一份页面。
                        </p>
                      </ShellCard>

                      <div className="flex flex-wrap gap-3">
                        <ShellLink href={availableSlugs[0] ? `/quiz/${availableSlugs[0]}` : "/"}>打开已配置测试</ShellLink>
                        <ShellLink href="/" secondary>
                          返回首页
                        </ShellLink>
                      </div>
                    </>
                  ) : shellState.kind === "expired" ? (
                    <>
                      <div className="space-y-4">
                        <ShellEyebrow>Expired Link</ShellEyebrow>
                        <h1 className="max-w-[11ch] font-[family:var(--font-quiz-display)] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          这条测试链接已经结束航行。
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          新作答已关闭。
                          {quiz
                            ? ` ${quiz.title} 的外壳仍然完整保留，后续只需接上题目流与结果页即可。`
                            : ""}
                          {quiz && shellState.attempt
                            ? ` 当前设备曾保存 ${getAnsweredQuestionCount(quiz, shellState.attempt.answers)} 道题的进度，但未完成结果摘要。`
                            : ""}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <ShellStat label="状态" value="不可再开始" />
                        <ShellStat label="截止时间" value={formatExpireAt(shellState.expireAt)} />
                        <ShellStat label="当前任务" value="展示过期视图" />
                      </div>

                      <ShellCard>
                        <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                          完成记录会由 Task 4 的路由状态契约优先转入摘要；只有未完成且已过期的链接才落到这个状态。
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
                        <ShellEyebrow>Storage Unavailable</ShellEyebrow>
                        <h1 className="max-w-[11ch] font-[family:var(--font-quiz-display)] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          当前浏览器无法保存这段测试旅程。
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          本项目把本地存储异常视为一等状态，而不是直接白屏。
                          你仍然能看见完整壳层，但续答和摘要回访需要可用的 `localStorage` 才能生效。
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <ShellStat label="恢复方式" value="开启浏览器存储" />
                        <ShellStat label="回访能力" value="暂不可用" />
                        <ShellStat label="路由契约" value="storage-unavailable" />
                      </div>

                      <ShellCard>
                        <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                          常见原因包括隐私模式拦截、浏览器禁用站点数据，或 SSR 环境下的提前访问。
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
                        <ShellEyebrow>Summary Container</ShellEyebrow>
                        <h1 className="max-w-[12ch] font-[family:var(--font-quiz-display)] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          你的归属星球已经被这一台设备记住了。
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                          新完成的测试会先进入长按揭晓，再落到完整摘要；已完成链接回访时则直接跳过长按，进入当前这张结果页。
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
                        <ShellEyebrow>Recovered Question Flow</ShellEyebrow>
                        <h1 className="max-w-[12ch] font-[family:var(--font-quiz-display)] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                          你的轨迹已经恢复到第 {shellState.nextQuestionIndex + 1} 题。
                        </h1>
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
                            <ShellEyebrow>{quiz?.theme ?? "Quiz"} Intro</ShellEyebrow>
                            <h1 className="max-w-[12ch] font-[family:var(--font-quiz-display)] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                              {quiz?.title}
                            </h1>
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
                                <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent)]">
                                  01 进入测试
                                </p>
                                <p className="mt-2 text-sm leading-7 text-[color:var(--quiz-muted)]">先确认主题与节奏，再进入一次只显示一题的作答流。</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent-soft)]">
                                  02 题目流转
                                </p>
                                <p className="mt-2 text-sm leading-7 text-[color:var(--quiz-muted)]">每次选择立即保存，并用短促动效推进到下一题。</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent-soft)]">
                                  03 结果摘要
                                </p>
                                <p className="mt-2 text-sm leading-7 text-[color:var(--quiz-muted)]">答完 8 题后交给已预留的摘要容器，不在这里提前实现揭晓体验。</p>
                              </div>
                            </div>
                          </ShellCard>

                          <div className="flex flex-wrap gap-3">
                            <ShellPrimaryButton disabled={false} onClick={() => setIsFlowActive(true)}>
                              开始测试
                            </ShellPrimaryButton>
                            <ShellLink href="/" secondary>
                              返回首页
                            </ShellLink>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <ShellEyebrow>Live Question Flow</ShellEyebrow>
                            <h1 className="max-w-[12ch] font-[family:var(--font-quiz-display)] text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl lg:text-6xl">
                              现在开始，把直觉落到一题一题的轨道里。
                            </h1>
                            <p className="max-w-2xl text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">
                              题目内容全部来自配置，壳层会维持当前视觉语言，真正变化的只有眼前这一张正在作答的题卡。
                            </p>
                          </div>

                          <QuizFlow
                            expireAt={expireAt}
                            initialAnswers={{}}
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

            <aside className="flex min-w-0 flex-col gap-4 rounded-[var(--quiz-radius-panel)] border border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-panel)] p-4 sm:p-5">
              <div className="space-y-3">
                <ShellEyebrow>Orbital Notes</ShellEyebrow>
                <h2 className="font-[family:var(--font-quiz-display)] text-2xl leading-tight text-[color:var(--quiz-text)]">
                  一个为移动端准备好的星际问答壳层。
                </h2>
                <p className="text-sm leading-7 text-[color:var(--quiz-muted)]">
                  壳层、背景和状态切换已固定下来，后续问题流与结果内容只需要插入中区，不需要再分叉页面。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <ShellStat label="当前状态" value={progressLabel} />
                <ShellStat label="链接截止" value={formatExpireAt(expireAt)} />
                <ShellStat label="本地回访" value="同设备优先恢复" />
              </div>

              <ShellCard>
                <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent)]">
                  Experience Guardrails
                </p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-muted)]">
                  动效只循环 `transform` 与 `opacity`，背景固定为三层装饰元素，并在系统偏好降低动态效果时停止非必要循环。
                </p>
              </ShellCard>

              <ShellCard>
                <p className="text-xs uppercase tracking-[var(--quiz-caps-tracking)] text-[color:var(--quiz-accent-soft)]">
                  Disclaimer
                </p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--quiz-muted)]">{disclaimer}</p>
              </ShellCard>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
