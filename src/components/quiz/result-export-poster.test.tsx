import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ResultExportPoster } from "@/src/components/quiz/result-export-poster";

describe("ResultExportPoster", () => {
  it("renders a concise export title, artwork slot, and description without helper chrome", () => {
    const markup = renderToStaticMarkup(
      <ResultExportPoster
        title="木卫二"
        description="你更依赖安静的观察和延迟表达。"
        artwork={<div>planet-artwork</div>}
      />,
    );

    expect(markup).toContain("木卫二");
    expect(markup).toContain("planet-artwork");
    expect(markup).toContain("你更依赖安静的观察和延迟表达");
    expect(markup).not.toContain("保存图片");
    expect(markup).not.toContain("观测图像");
  });
});
