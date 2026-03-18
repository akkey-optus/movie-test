export type QuizRouteMeta = {
  slug: string;
  heading: string;
  description: string;
};

function toTitleCase(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getQuizRouteMeta(slug: string): QuizRouteMeta {
  if (slug === "planet_test") {
    return {
      slug,
      heading: "planet_test scaffold",
      description:
        "This placeholder route proves the dynamic App Router path exists and is ready for later quiz engine wiring.",
    };
  }

  return {
    slug,
    heading: `${toTitleCase(slug)} scaffold`,
    description:
      "This placeholder route is intentionally minimal so later tasks can attach config-driven quiz logic without reworking the route contract.",
  };
}
