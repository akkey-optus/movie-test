import { QuizShell } from "@/src/components/quiz/quiz-shell";
import { loadQuizCatalog } from "@/src/lib/config";

type QuizRoutePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstSearchParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parseExpireAt(value?: string) {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export default async function QuizRoutePage({ params, searchParams }: QuizRoutePageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const catalog = loadQuizCatalog();
  const quiz = catalog.quizzes[slug] ?? null;
  const token = getFirstSearchParamValue(resolvedSearchParams.token) ?? null;
  const expireAt = parseExpireAt(getFirstSearchParamValue(resolvedSearchParams.expireAt));

  return (
    <QuizShell
      availableSlugs={catalog.slugs}
      disclaimer={catalog.meta.disclaimer}
      expireAt={expireAt}
      quiz={quiz}
      slug={slug}
      tieBreaker={catalog.meta.tieBreaker}
      token={token}
    />
  );
}
