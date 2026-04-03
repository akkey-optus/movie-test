import Link from "next/link";

import { QuizBackground } from "@/src/components/quiz/quiz-background";
import { loadQuizCatalog } from "@/src/lib/config";

function formatRouteIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export default function HubPage() {
  const catalog = loadQuizCatalog();
  const quizzes = catalog.slugs.map((slug) => catalog.quizzes[slug]).filter(Boolean);
  const featuredQuiz = catalog.quizzes.movie_test ?? quizzes[0] ?? null;
  const totalQuestionCount = quizzes.reduce((total, quiz) => total + quiz.questions.length, 0);

  return (
    <main className="relative isolate min-h-screen overflow-hidden text-[color:var(--page-text)]">
      <QuizBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[84rem] flex-col px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
        <section className="atlas-shell flex-1 rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="relative z-10 space-y-8 lg:space-y-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--page-muted-strong)]">
                <span className="detail-label text-[color:var(--page-accent)]">星图手记</span>
                <span className="atlas-chip rounded-full px-3 py-1">卷一</span>
              </div>

              <span className="atlas-chip rounded-full px-3 py-1 text-xs">单题推进 · 同设备记忆 · 轻量动效</span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_22rem] lg:items-start">
              <div className="space-y-8">
                <div className="space-y-5">
                  <p className="detail-label text-xs text-[color:var(--page-accent-cool)]">
                    为安静的选择留下航迹
                  </p>
                  <h1 className="editorial-title max-w-[10ch] text-5xl leading-[0.94] text-[color:var(--page-text-strong)] sm:text-6xl lg:text-7xl">
                    把直觉写进星图，让每段问答像一页观测手记。
                  </h1>
                  <p className="max-w-2xl text-sm leading-8 text-[color:var(--page-muted)] sm:text-base">
                    这里收着三段已经上线的旅程：你一次只会看见一道题，顺着当下的判断继续往前，最后把结果留在同一台设备里，随时回来看这次落点停在了哪里。
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {featuredQuiz ? (
                    <Link
                      className="metal-button inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-[0.08em] transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--page-accent-strong)]"
                      href={`/quiz/${featuredQuiz.slug}`}
                    >
                      从 {featuredQuiz.theme} 航线开始
                    </Link>
                  ) : null}
                  <a
                    className="ghost-button inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-[0.08em] transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--page-accent-cool-strong)]"
                    href="#routes"
                  >
                    查看全部航线
                  </a>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <article className="atlas-panel rounded-[1.4rem] p-5 sm:p-6">
                    <p className="detail-label text-[11px] text-[color:var(--page-accent)]">航线总数</p>
                    <p className="mt-4 text-3xl font-semibold text-[color:var(--page-text-strong)]">{quizzes.length}</p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--page-muted)]">三段主题已经接入，入口与问答页共享同一套星图语言。</p>
                  </article>
                  <article className="atlas-panel rounded-[1.4rem] p-5 sm:p-6">
                    <p className="detail-label text-[11px] text-[color:var(--page-accent-cool)]">题目节奏</p>
                    <p className="mt-4 text-3xl font-semibold text-[color:var(--page-text-strong)]">{totalQuestionCount}</p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--page-muted)]">所有旅程合计 {totalQuestionCount} 道题，保持一题一屏的干净节奏。</p>
                  </article>
                  <article className="atlas-panel rounded-[1.4rem] p-5 sm:p-6">
                    <p className="detail-label text-[11px] text-[color:var(--page-accent)]">结果归档</p>
                    <p className="mt-4 text-3xl font-semibold text-[color:var(--page-text-strong)]">{catalog.meta.resultCount}</p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--page-muted)]">结果会被写入本地记录，回访同一路径时直接抵达已保存的终点页。</p>
                  </article>
                </div>
              </div>

              <aside className="atlas-panel rounded-[1.6rem] p-5 sm:p-6">
                <div className="relative z-10 space-y-6">
                  <div className="space-y-3">
                    <p className="detail-label text-[11px] text-[color:var(--page-accent-cool)]">观测侧记</p>
                    <h2 className="editorial-title text-3xl leading-tight text-[color:var(--page-text-strong)] sm:text-[2.2rem]">
                      为短而有余韵的问答体验校准夜空。
                    </h2>
                    <p className="text-sm leading-7 text-[color:var(--page-muted)]">
                      先在这里看清整套旅程的节奏、质感与回访方式，再自然进入第一条航线，整段体验会更连贯。
                    </p>
                  </div>

                  <div className="rounded-[1.35rem] border border-[color:var(--page-border)] bg-[rgba(240,232,215,0.03)] p-4">
                    <svg aria-hidden className="h-auto w-full text-[color:var(--page-accent)]" viewBox="0 0 260 220">
                      <title>Observatory chart motif</title>
                      <circle cx="130" cy="110" fill="none" opacity="0.45" r="78" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="130" cy="110" fill="none" opacity="0.18" r="50" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M46 70L102 94L156 64L214 88" fill="none" opacity="0.45" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M58 150L96 126L154 144L206 118" fill="none" opacity="0.3" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M130 32V188M52 110H208" opacity="0.22" stroke="currentColor" strokeDasharray="4 8" strokeWidth="1.1" />
                      <circle cx="46" cy="70" fill="currentColor" r="3" />
                      <circle cx="102" cy="94" fill="currentColor" r="2.5" />
                      <circle cx="156" cy="64" fill="currentColor" r="3" />
                      <circle cx="214" cy="88" fill="currentColor" r="2.5" />
                      <circle cx="58" cy="150" fill="currentColor" r="2.5" />
                      <circle cx="96" cy="126" fill="currentColor" r="2.5" />
                      <circle cx="154" cy="144" fill="currentColor" r="3" />
                      <circle cx="206" cy="118" fill="currentColor" r="2.5" />
                    </svg>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-[color:var(--page-border)] px-4 py-3">
                      <span className="text-sm text-[color:var(--page-muted)]">默认入口</span>
                      <span className="text-sm font-semibold text-[color:var(--page-text-strong)]">
                        {featuredQuiz?.theme ?? "已就绪"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-[color:var(--page-border)] px-4 py-3">
                      <span className="text-sm text-[color:var(--page-muted)]">结果存档</span>
                      <span className="text-sm font-semibold text-[color:var(--page-text-strong)]">同设备优先恢复</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-[color:var(--page-border)] px-4 py-3">
                      <span className="text-sm text-[color:var(--page-muted)]">体验基调</span>
                      <span className="text-sm font-semibold text-[color:var(--page-text-strong)]">观测手记 / 星图导航</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <div className="atlas-rule" />

            <section className="space-y-5" id="routes">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <p className="detail-label text-[11px] text-[color:var(--page-accent)]">可用航线</p>
                  <h2 className="editorial-title text-3xl leading-tight text-[color:var(--page-text-strong)] sm:text-4xl">
                    从封面翻到具体航线，每一段都有自己的落脚方式。
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-[color:var(--page-muted)]">
                  入口与作答页共享同一套材质、排版和星图细节，所以无论你先从哪条路线进入，视觉语言都会连续而自然。
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {quizzes.map((quiz, index) => (
                  <Link
                    className="atlas-panel group rounded-[1.6rem] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--page-border-strong)] sm:p-6"
                    href={`/quiz/${quiz.slug}`}
                    key={quiz.slug}
                  >
                    <div className="relative z-10 flex h-full flex-col">
                      <div className="flex items-center justify-between gap-3">
                        <span className="detail-label text-[11px] text-[color:var(--page-accent-cool)]">
                          航线 {formatRouteIndex(index)}
                        </span>
                        <span className="atlas-chip rounded-full px-3 py-1 text-[11px]">{quiz.questions.length} 道题</span>
                      </div>

                      <div className="mt-6 space-y-3">
                        <p className="detail-label text-[11px] text-[color:var(--page-accent)]">{quiz.theme}</p>
                        <h3 className="editorial-title text-3xl leading-tight text-[color:var(--page-text-strong)]">
                          {quiz.title}
                        </h3>
                        <p className="text-base text-[color:var(--page-accent-cool-strong)]">{quiz.subtitle}</p>
                      </div>

                      <p className="mt-4 min-h-[5.25rem] text-sm leading-7 text-[color:var(--page-muted)]">{quiz.intro}</p>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <div className="rounded-[1.1rem] border border-[color:var(--page-border)] bg-[rgba(240,232,215,0.03)] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--page-muted)]">开场提示</p>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--page-text)]">{quiz.questions[0]?.text}</p>
                        </div>
                        <div className="rounded-[1.1rem] border border-[color:var(--page-border)] bg-[rgba(240,232,215,0.03)] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--page-muted)]">终点留存</p>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--page-text)]">完成后直接保存你的最终落点。</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-[color:var(--page-border)] pt-4 text-sm">
                        <span className="text-[color:var(--page-muted)]">进入这段观测记录</span>
                        <span className="font-semibold text-[color:var(--page-accent-strong)]">打开航线</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <footer className="atlas-panel rounded-[1.35rem] px-5 py-4 sm:px-6">
              <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="detail-label text-[11px] text-[color:var(--page-accent-cool)]">附记</p>
                  <p className="max-w-2xl text-sm leading-7 text-[color:var(--page-muted)]">{catalog.meta.disclaimer}</p>
                </div>
                <p className="text-sm leading-7 text-[color:var(--page-text)]">
                  在手机与桌面上都保持轻盈、清晰和可回访的作答节奏。
                </p>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
