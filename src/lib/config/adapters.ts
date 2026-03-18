import type { SourceQuiz, SourceResultRecord, QuizResultExtras } from "@/src/lib/config/types";

type ResultExtrasAdapter = (result: SourceResultRecord) => QuizResultExtras;

const defaultResultExtrasAdapter: ResultExtrasAdapter = (result) => ({
  representative: result.representative,
  representativeWorks: result.representative_works,
  whyLikeThis: result.why_like_this,
});

const planetResultExtrasAdapter: ResultExtrasAdapter = (result) => ({
  representative: result.representative,
});

const movieResultExtrasAdapter: ResultExtrasAdapter = (result) => ({
  representativeWorks: result.representative_works,
  whyLikeThis: result.why_like_this,
});

const xianlingResultExtrasAdapter: ResultExtrasAdapter = (result) => ({
  representative: result.representative,
});

const RESULT_EXTRAS_ADAPTERS: Record<string, ResultExtrasAdapter> = {
  planet_test: planetResultExtrasAdapter,
  movie_test: movieResultExtrasAdapter,
  xianling_test: xianlingResultExtrasAdapter,
};

export function adaptResultExtras(quiz: SourceQuiz, result: SourceResultRecord): QuizResultExtras {
  const adapter = RESULT_EXTRAS_ADAPTERS[quiz.id] ?? defaultResultExtrasAdapter;

  return adapter(result);
}
