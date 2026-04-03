import { expect, test, type Page } from "@playwright/test";

const planetQuestions = [
  "刚抵达一颗陌生星球，你第一反应更像：",
  "你更容易被哪种星球吸引：",
  "如果要长期定居，你最看重：",
  "搬去一颗新星球生活，你会：",
  "如果和同行者一起落地陌生星球，你更像：",
  "你更相信一颗星球的魅力来自：",
  "如果大家对定居方案意见不一，你更倾向：",
  "你理想中的星球生活更像：",
] as const;

const rawTypeCodePattern = /\b(?:E\/I|S\/N|T\/F|J\/P|[IE][SN][TF][JP])\b/;

async function openPlanetQuiz(page: Page) {
  await page.goto("/quiz/planet_test");
  await expect(page).not.toHaveTitle(/MBTI/i);
  await expect(page.getByRole("heading", { name: "找出最适合你降落的星球" })).toBeVisible();
}

test("root redirects to the canonical movie quiz and hub hosts the portal", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/quiz\/movie_test$/, { timeout: 15000 });
  await expect(page).toHaveURL(/\/quiz\/movie_test$/);
  await expect(page.getByRole("heading", { name: "看看你的人生会展开成哪种电影" })).toBeVisible();

  await page.goto("/hub");
  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByRole("heading", { name: "把直觉写进星图，让每段问答像一页观测手记。" })).toBeVisible();
  await expect(page.getByRole("link", { name: /从 .* 航线开始/ })).toHaveAttribute("href", "/quiz/movie_test");
});

test("quiz routes link back to the hub instead of the public root", async ({ page }) => {
  await page.goto("/quiz/movie_test");
  await expect(page).toHaveURL(/\/quiz\/movie_test$/);
  await expect(page.locator('a[href="/"]')).toHaveCount(0);
  await expect(page.locator('a[href="/hub"]')).toHaveCount(2);
});

test("unknown quiz slugs stay safe and offer non-root recovery links", async ({ page }) => {
  await page.goto("/quiz/not-a-real-quiz");
  await expect(page).toHaveURL(/\/quiz\/not-a-real-quiz$/);
  await expect(page.getByRole("heading", { name: "这段旅程暂时还没有落到星图里。" })).toBeVisible();
  await expect(page.getByRole("link", { name: "打开可用旅程" })).toHaveAttribute("href", "/quiz/planet_test");
  await expect(page.locator('a[href="/hub"]')).toHaveCount(2);
  await expect(page.locator('a[href="/"]')).toHaveCount(0);
});

async function startPlanetQuiz(page: Page) {
  await openPlanetQuiz(page);
  await page.getByRole("button", { name: "开始旅程" }).click();
  await expect(page.getByRole("heading", { name: planetQuestions[0] })).toBeVisible();
}

test("planet intro starts cleanly and hides raw type cues", async ({ page }) => {
  await startPlanetQuiz(page);

  await page.getByTestId("answer-option-A").click({ force: true });
  await expect(page.getByRole("heading", { name: planetQuestions[1] })).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(rawTypeCodePattern);
  expect(bodyText).not.toContain("MBTI");
});

test("planet result reveal keeps the final card free of type codes", async ({ page }) => {
  test.slow();
  await startPlanetQuiz(page);

  for (const [index, question] of planetQuestions.entries()) {
    await expect(page.getByRole("heading", { name: question })).toBeVisible();
    await page.getByTestId("answer-option-A").click({ force: true });

    if (index < planetQuestions.length - 1) {
      await expect(page.getByRole("heading", { name: planetQuestions[index + 1] })).toBeVisible();
    }
  }

  const revealButton = page.getByTestId("reveal-result-button");
  await expect(revealButton).toBeVisible();

  const buttonBox = await revealButton.boundingBox();
  if (!buttonBox) {
    throw new Error("Reveal button is not interactable.");
  }

  await page.mouse.move(buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(950);
  await page.mouse.up();

  await expect(page.getByTestId("quiz-result-card")).toBeVisible();
  await expect(page.getByRole("heading", { name: "地球" })).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(rawTypeCodePattern);
  expect(bodyText).not.toContain("MBTI");
});
