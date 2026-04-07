import type { ReactNode } from "react";

type ResultExportPosterProps = {
  title: string;
  description: string;
  artwork: ReactNode;
};

export function ResultExportPoster({ title, description, artwork }: ResultExportPosterProps) {
  return (
    <article className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] border border-[color:var(--quiz-border-soft)] bg-[linear-gradient(180deg,rgba(9,15,24,0.96)_0%,rgba(13,22,34,0.98)_100%)] p-5 text-[color:var(--quiz-text)] shadow-[0_30px_80px_rgba(9,15,24,0.35)] sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--quiz-glow-primary)_0%,transparent_48%),radial-gradient(circle_at_bottom,var(--quiz-glow-secondary)_0%,transparent_42%)] opacity-80" />
      <div className="relative flex h-full flex-col gap-5">
        <div className="space-y-3">
          <h2 className="editorial-title text-4xl leading-none text-[color:var(--quiz-text)] sm:text-5xl">{title}</h2>
          <p className="text-sm leading-7 text-[color:var(--quiz-muted)] sm:text-base">{description}</p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-[color:var(--quiz-border-soft)] bg-[rgba(240,232,215,0.06)]">
          {artwork}
        </div>
      </div>
    </article>
  );
}
