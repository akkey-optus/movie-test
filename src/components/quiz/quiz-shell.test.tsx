import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import rawQuizCatalogConfig from "@/test-setting.json";
import { QuizShell } from "@/src/components/quiz/quiz-shell";
import { loadQuizCatalogFromSource } from "@/src/lib/config";

const catalog = loadQuizCatalogFromSource(rawQuizCatalogConfig);
const quiz = catalog.quizzes.xianling_test;

describe("QuizShell", () => {
  it("hides hub return affordance and technical metadata in intro state", () => {
    const markup = renderToStaticMarkup(
      <QuizShell
        availableSlugs={catalog.slugs}
        disclaimer="demo"
        expireAt={4102444800000}
        quiz={quiz}
        slug={quiz.slug}
        tieBreaker={[]}
        token="demo-token"
      />,
    );

    expect(markup).not.toContain("返回旅程总览");
    expect(markup).not.toContain("slug ·");
    expect(markup).not.toContain("token ·");
    expect(markup).toContain("mx-auto max-w-[12ch] text-balance text-center");
  });

  it("renders the expired state on first paint when token is missing", () => {
    const markup = renderToStaticMarkup(
      <QuizShell
        availableSlugs={catalog.slugs}
        disclaimer="demo"
        expireAt={4102444800000}
        quiz={quiz}
        slug={quiz.slug}
        tieBreaker={[]}
        token={null}
      />,
    );

    expect(markup).toContain("这条旅程链接已经结束航行");
    expect(markup).not.toContain("开始旅程");
    expect(markup).toContain("请回到分享入口重新生成一条有效链接");
  });

  it("renders the expired state when expireAt is missing", () => {
    const markup = renderToStaticMarkup(
      <QuizShell
        availableSlugs={catalog.slugs}
        disclaimer="demo"
        expireAt={null}
        quiz={quiz}
        slug={quiz.slug}
        tieBreaker={[]}
        token="demo-token"
      />,
    );

    expect(markup).toContain("这条旅程链接已经结束航行");
    expect(markup).not.toContain("开始旅程");
  });

  it("does not render a bare quiz CTA in the unknown-slug state", () => {
    const markup = renderToStaticMarkup(
      <QuizShell
        availableSlugs={catalog.slugs}
        disclaimer="demo"
        expireAt={4102444800000}
        quiz={null}
        slug="missing_quiz"
        tieBreaker={[]}
        token="demo-token"
      />,
    );

    expect(markup).not.toContain('href="/quiz/');
    expect(markup).toContain("先回到已经可用的入口");
  });
});
