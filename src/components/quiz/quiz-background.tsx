"use client";

import { motion, useReducedMotion } from "motion/react";

import type { QuizThemeId } from "@/src/components/quiz/quiz-theme";

type QuizBackgroundProps = {
  themeId?: QuizThemeId;
};

function renderPatternFrame(themeId: QuizThemeId) {
  if (themeId === "movie") {
    return (
      <>
        <div className="absolute inset-[6%] rounded-[2.8rem] border-[3px] border-[color:var(--quiz-border-strong)]" />
        <div className="absolute left-[10%] top-[12%] h-[24%] w-[28%] -rotate-2 rounded-[2rem] border-[3px] border-[color:var(--quiz-border-soft)] bg-[color:var(--quiz-accent-soft-fill)] opacity-70" />
        <div className="absolute right-[9%] top-[18%] h-[18%] w-[22%] rotate-3 rounded-[999px] border-[3px] border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-accent-warm-fill)] opacity-80" />
        <div className="absolute bottom-[11%] left-[14%] h-[18%] w-[26%] -rotate-3 rounded-[2rem] border-[3px] border-[color:var(--quiz-border-strong)] bg-[color:var(--quiz-accent-soft-fill)] opacity-80" />
        <div className="absolute inset-x-[13%] top-[50%] h-[3px] -translate-y-1/2 bg-[linear-gradient(90deg,transparent,var(--quiz-border-strong),transparent)]" />
        <div className="absolute left-[50%] top-[14%] h-[72%] w-[3px] -translate-x-1/2 bg-[linear-gradient(180deg,transparent,var(--quiz-border-soft),transparent)]" />
      </>
    );
  }

  if (themeId === "fairy") {
    return (
      <>
        <div className="absolute inset-x-[9%] top-[10%] bottom-[10%] rounded-[2.8rem] border border-[color:var(--quiz-border-soft)] bg-[rgba(255,252,244,0.22)]" />
        <div className="absolute left-[10%] top-[10%] bottom-[10%] w-3 rounded-full bg-[color:var(--quiz-border-strong)] opacity-35" />
        <div className="absolute right-[10%] top-[10%] bottom-[10%] w-3 rounded-full bg-[color:var(--quiz-border-strong)] opacity-35" />
        <div className="absolute inset-x-[18%] top-[18%] h-px bg-[linear-gradient(90deg,transparent,var(--quiz-border-soft),transparent)]" />
        <div className="absolute inset-x-[18%] bottom-[18%] h-px bg-[linear-gradient(90deg,transparent,var(--quiz-border-soft),transparent)]" />
        <div className="absolute left-1/2 top-[20%] h-[60%] w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,var(--quiz-accent-soft),transparent)] opacity-65" />
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-[var(--quiz-orbit-inset-md)] rounded-full border border-[color:var(--quiz-border-soft)]" />
      <div className="absolute inset-[var(--quiz-orbit-inset-sm)] rounded-full border border-[color:var(--quiz-border-soft)]" />
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(216,181,127,0.3),transparent)]" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(151,183,202,0.22),transparent)]" />
    </>
  );
}

function renderAnimatedField(themeId: QuizThemeId) {
  if (themeId === "movie") {
    return (
      <>
        <div className="absolute left-1/2 top-16 h-[min(92vw,40rem)] w-[min(92vw,40rem)] -translate-x-1/2 bg-[radial-gradient(circle,rgba(17,17,17,0.1)_0_1px,transparent_1.7px)] bg-[length:26px_26px] opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0_28%,rgba(17,17,17,0.09)_28%_30%,transparent_30%_62%,rgba(17,17,17,0.08)_62%_64%,transparent_64%),radial-gradient(circle_at_22%_24%,var(--quiz-glow-primary)_0_1px,transparent_1.7px),radial-gradient(circle_at_76%_18%,var(--quiz-glow-secondary)_0_1px,transparent_1.7px)]" />
      </>
    );
  }

  if (themeId === "fairy") {
    return (
      <>
        <div className="absolute left-1/2 top-24 h-[min(90vw,40rem)] w-[min(90vw,40rem)] -translate-x-1/2 bg-[radial-gradient(circle,rgba(93,75,60,0.08)_0_1px,transparent_1.8px)] bg-[length:32px_32px] opacity-28" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,var(--quiz-glow-secondary)_0_1px,transparent_1.8px),radial-gradient(circle_at_74%_18%,var(--quiz-glow-primary)_0_1px,transparent_1.8px),linear-gradient(180deg,transparent_0_18%,rgba(97,76,60,0.05)_40%,transparent_64%)]" />
      </>
    );
  }

  return (
    <>
      <div className="absolute left-1/2 top-24 h-[var(--quiz-dots-size)] w-[var(--quiz-dots-size)] -translate-x-1/2 bg-[radial-gradient(circle,var(--quiz-star-bright)_0_1px,transparent_1.5px)] bg-[length:var(--quiz-dot-grid-size)_var(--quiz-dot-grid-size)] opacity-65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,var(--quiz-glow-primary)_0_1px,transparent_1.5px),radial-gradient(circle_at_74%_18%,var(--quiz-glow-secondary)_0_1px,transparent_1.5px),radial-gradient(circle_at_68%_72%,var(--quiz-star-soft)_0_1px,transparent_1.5px),radial-gradient(circle_at_32%_78%,rgba(216,181,127,0.14)_0_1px,transparent_1.5px)]" />
    </>
  );
}

function renderStaticGlow(themeId: QuizThemeId) {
  if (themeId === "movie") {
    return (
      <div className="absolute inset-0 opacity-55">
        <div className="absolute left-[-4%] top-[8%] h-[min(72vw,26rem)] w-[min(72vw,26rem)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-primary)_0%,transparent_72%)] blur-[var(--quiz-blur-glow)]" />
        <div className="absolute bottom-[-7%] right-[0%] h-[min(64vw,22rem)] w-[min(64vw,22rem)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-secondary)_0%,transparent_74%)] blur-[var(--quiz-blur-glow)]" />
      </div>
    );
  }

  if (themeId === "fairy") {
    return (
      <div className="absolute inset-0 opacity-52">
        <div className="absolute left-[2%] top-[14%] h-[min(70vw,24rem)] w-[min(70vw,24rem)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-secondary)_0%,transparent_74%)] blur-[var(--quiz-blur-glow)]" />
        <div className="absolute bottom-[-10%] right-[4%] h-[min(62vw,20rem)] w-[min(62vw,20rem)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-primary)_0%,transparent_72%)] blur-[var(--quiz-blur-glow)]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 opacity-50">
      <div className="absolute left-[var(--quiz-glow-primary-left)] top-[var(--quiz-glow-primary-top)] h-[var(--quiz-glow-size-lg)] w-[var(--quiz-glow-size-lg)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-primary)_0%,transparent_72%)] blur-[var(--quiz-blur-glow)]" />
      <div className="absolute bottom-[var(--quiz-glow-secondary-bottom)] right-[var(--quiz-glow-secondary-right)] h-[var(--quiz-glow-size-sm)] w-[var(--quiz-glow-size-sm)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-secondary)_0%,transparent_74%)] blur-[var(--quiz-blur-glow)]" />
    </div>
  );
}

function renderOverlaySvg(themeId: QuizThemeId) {
  if (themeId === "movie") {
    return (
      <svg className="absolute inset-0 h-full w-full opacity-[0.22]" viewBox="0 0 1440 1024">
        <title>Background comic spread</title>
        <rect x="182" y="148" width="398" height="264" rx="38" fill="none" stroke="var(--quiz-border-strong)" strokeWidth="4" />
        <rect x="648" y="178" width="612" height="218" rx="38" fill="none" stroke="var(--quiz-border-soft)" strokeWidth="4" />
        <rect x="252" y="512" width="936" height="280" rx="42" fill="none" stroke="rgba(17,17,17,0.18)" strokeWidth="4" />
        <path d="M282 568H1158" stroke="rgba(17,17,17,0.18)" strokeDasharray="12 16" strokeWidth="3" />
        <path d="M720 198V790" stroke="rgba(17,17,17,0.14)" strokeDasharray="10 20" strokeWidth="3" />
        <circle cx="182" cy="148" fill="var(--quiz-accent)" r="7" />
        <circle cx="1260" cy="396" fill="var(--quiz-accent-soft)" r="7" />
        <circle cx="252" cy="792" fill="var(--quiz-star-bright)" r="7" />
        <circle cx="1188" cy="792" fill="var(--quiz-accent)" r="7" />
      </svg>
    );
  }

  if (themeId === "fairy") {
    return (
      <svg className="absolute inset-0 h-full w-full opacity-[0.24]" viewBox="0 0 1440 1024">
        <title>Background scroll and ink wash</title>
        <path d="M220 226C322 190 434 194 534 232C620 264 712 272 812 236" fill="none" stroke="var(--quiz-border-soft)" strokeWidth="2" />
        <path d="M624 168C686 210 756 228 842 226C930 224 1004 198 1090 172" fill="none" stroke="rgba(98,79,61,0.16)" strokeWidth="2" />
        <path d="M196 738C302 702 412 706 520 742C630 778 756 780 874 728" fill="none" stroke="var(--quiz-border-soft)" strokeWidth="2" />
        <path d="M734 136V862" stroke="rgba(98,79,61,0.12)" strokeDasharray="8 20" strokeWidth="2" />
        <circle cx="534" cy="232" fill="var(--quiz-accent-soft)" r="4" />
        <circle cx="808" cy="236" fill="var(--quiz-accent)" r="4" />
        <circle cx="520" cy="742" fill="var(--quiz-star-bright)" r="4" />
        <circle cx="874" cy="728" fill="var(--quiz-accent-soft)" r="4" />
      </svg>
    );
  }

  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.26]" viewBox="0 0 1440 1024">
      <title>Background star chart</title>
      <path d="M168 216L322 182L488 230L634 194" stroke="var(--quiz-border-soft)" strokeWidth="1.2" />
      <path d="M916 242L1076 184L1216 234L1326 196" stroke="var(--quiz-border-soft)" strokeWidth="1.2" />
      <path d="M220 746L356 694L504 742L650 700" stroke="var(--quiz-border-soft)" strokeWidth="1.2" />
      <path d="M744 120L744 904" stroke="rgba(199,213,228,0.18)" strokeDasharray="4 12" strokeWidth="1" />
      <circle cx="168" cy="216" fill="var(--quiz-accent)" r="2.4" />
      <circle cx="322" cy="182" fill="var(--quiz-star-bright)" r="2.4" />
      <circle cx="488" cy="230" fill="var(--quiz-accent-soft)" r="2.4" />
      <circle cx="634" cy="194" fill="var(--quiz-star-bright)" r="2.4" />
      <circle cx="916" cy="242" fill="var(--quiz-accent-soft)" r="2.4" />
      <circle cx="1076" cy="184" fill="var(--quiz-star-bright)" r="2.4" />
      <circle cx="1216" cy="234" fill="var(--quiz-accent)" r="2.4" />
      <circle cx="1326" cy="196" fill="var(--quiz-star-bright)" r="2.4" />
      <circle cx="220" cy="746" fill="var(--quiz-star-bright)" r="2.4" />
      <circle cx="356" cy="694" fill="var(--quiz-accent-soft)" r="2.4" />
      <circle cx="504" cy="742" fill="var(--quiz-star-bright)" r="2.4" />
      <circle cx="650" cy="700" fill="var(--quiz-accent)" r="2.4" />
    </svg>
  );
}

export function QuizBackground({ themeId = "planet" }: QuizBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();

  const veilAnimation = prefersReducedMotion
    ? undefined
    : {
        opacity: [0.18, 0.3, 0.2],
        scale: [1, 1.02, 1],
        x: [0, 8, -6, 0],
        y: [0, -10, 8, 0],
      };
  const orbitAnimation = prefersReducedMotion
    ? undefined
    : {
        opacity: [0.3, 0.42, 0.3],
        rotate: [0, 4, -3, 0],
        scale: [1, 1.01, 0.995, 1],
      };
  const fieldAnimation = prefersReducedMotion
    ? undefined
    : {
        opacity: [0.16, 0.26, 0.18],
        x: [0, 12, -10, 0],
        y: [0, 10, -12, 0],
      };

  const veilClassName =
    themeId === "movie"
      ? "absolute left-1/2 top-[9%] h-[min(94vw,46rem)] w-[min(94vw,46rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,214,83,0.22)_0%,transparent_58%)] blur-[calc(var(--quiz-blur-glow)*1.04)]"
      : themeId === "fairy"
        ? "absolute left-1/2 top-[7%] h-[min(96vw,48rem)] w-[min(96vw,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,145,111,0.16)_0%,transparent_66%)] blur-[calc(var(--quiz-blur-glow)*1.08)]"
        : "absolute left-1/2 top-[8%] h-[min(96vw,48rem)] w-[min(96vw,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(151,183,202,0.18)_0%,transparent_64%)] blur-[calc(var(--quiz-blur-glow)*1.08)]";
  const frameClassName =
    themeId === "movie"
      ? "absolute left-1/2 top-10 h-[min(84vw,32rem)] w-[min(86vw,40rem)] -translate-x-1/2 rounded-[2.6rem] border-[3px] border-[color:var(--quiz-border-strong)] opacity-55"
      : "absolute left-1/2 top-8 h-[var(--quiz-orbit-size)] w-[var(--quiz-orbit-size)] -translate-x-1/2 rounded-full border border-[color:var(--quiz-border-strong)] opacity-40";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={veilAnimation}
        className={veilClassName}
        style={{ willChange: "transform, opacity" }}
        transition={{ duration: 34, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />

      <motion.div
        animate={orbitAnimation}
        className={frameClassName}
        style={{ willChange: "transform, opacity" }}
        transition={{ duration: 38, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      >
        {renderPatternFrame(themeId)}
      </motion.div>

      <motion.div
        animate={fieldAnimation}
        className="absolute inset-0 opacity-45"
        style={{ willChange: "transform, opacity" }}
        transition={{ duration: 30, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      >
        {renderAnimatedField(themeId)}
      </motion.div>

      {renderStaticGlow(themeId)}
      {renderOverlaySvg(themeId)}
    </div>
  );
}
