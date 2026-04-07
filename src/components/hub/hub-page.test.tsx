import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import rawQuizCatalogConfig from "@/test-setting.json";
import HubPage from "@/app/hub/page";
import { loadQuizCatalogFromSource } from "@/src/lib/config";

const catalog = loadQuizCatalogFromSource(rawQuizCatalogConfig);

describe("HubPage", () => {
  it("renders one share button for each quiz card", () => {
    const markup = renderToStaticMarkup(<HubPage />);
    const shareButtonCount = markup.match(/data-testid="share-quiz-button"/g)?.length ?? 0;

    expect(shareButtonCount).toBe(catalog.slugs.length);
  });

  it("does not render bare quiz route links from the hub page", () => {
    const markup = renderToStaticMarkup(<HubPage />);

    expect(markup).not.toContain('href="/quiz/');
  });
});
