import { describe, expect, it, vi } from "vitest";

import { buildShareQuizLink, createShareToken, getShareExpireAt, isShareTokenValid } from "@/src/lib/share/share-link";

describe("share-link", () => {
  it("builds a quiz share URL with token and expireAt query params", () => {
    const link = buildShareQuizLink({
      expireAt: 1760000000000,
      origin: "https://example.com",
      slug: "planet_test",
      token: "demo-token",
    });

    expect(link).toBe("https://example.com/quiz/planet_test?token=demo-token&expireAt=1760000000000");
  });

  it("creates a stable 48-hour expiry window from now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-06T10:00:00.000Z"));

    expect(getShareExpireAt()).toBe(new Date("2026-04-08T10:00:00.000Z").getTime());

    vi.useRealTimers();
  });

  it("creates a non-empty token for share links", () => {
    const token = createShareToken();

    expect(token).toMatch(/^[a-z0-9-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(8);
  });

  it("validates share token shape", () => {
    expect(isShareTokenValid("demo-token")).toBe(true);
    expect(isShareTokenValid("")).toBe(false);
    expect(isShareTokenValid("bad token")).toBe(false);
  });
});
