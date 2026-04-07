const SHARE_LINK_TTL_MS = 48 * 60 * 60 * 1000;
const SHARE_TOKEN_PATTERN = /^[a-z0-9-]+$/;

type BuildShareQuizLinkParams = {
  origin: string;
  slug: string;
  token: string;
  expireAt: number;
};

function buildFallbackToken() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createShareToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().toLowerCase();
  }

  return buildFallbackToken();
}

export function isShareTokenValid(token: string | null | undefined) {
  return typeof token === "string" && SHARE_TOKEN_PATTERN.test(token.trim());
}

export function getShareExpireAt(now = Date.now()) {
  return now + SHARE_LINK_TTL_MS;
}

export function buildShareQuizLink({ expireAt, origin, slug, token }: BuildShareQuizLinkParams) {
  const url = new URL(`/quiz/${slug}`, origin);
  url.searchParams.set("token", token);
  url.searchParams.set("expireAt", String(expireAt));
  return url.toString();
}
