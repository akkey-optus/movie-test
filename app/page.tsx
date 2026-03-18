export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff,transparent_50%),linear-gradient(180deg,#fefefe_0%,#eef4ff_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(76,98,140,0.12)] backdrop-blur md:p-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Planet MBTI Quiz Template
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Next.js App Router scaffold with Tailwind, Vitest, and Playwright.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Task 1 sets the baseline route structure, test runners, and build tooling for the quiz app.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Route foundation</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">`/quiz/[slug]`</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Unit tests</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Vitest baseline</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">E2E tests</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Playwright projects</p>
          </div>
        </div>

        <a
          href="/quiz/planet_test"
          className="inline-flex w-fit items-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Open the `planet_test` route scaffold
        </a>
      </div>
    </main>
  );
}
