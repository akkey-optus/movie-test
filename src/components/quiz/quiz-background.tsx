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
        <div className="absolute inset-[6%] rounded-[2.25rem] border border-[color:var(--quiz-border-soft)]" />
        <div className="absolute inset-x-[12%] top-[13%] h-px bg-[linear-gradient(90deg,transparent,var(--quiz-line-shine),transparent)]" />
        <div className="absolute inset-x-[12%] bottom-[13%] h-px bg-[linear-gradient(90deg,transparent,var(--quiz-line-shine),transparent)]" />
        <div className="absolute inset-y-[18%] left-[18%] w-px bg-[linear-gradient(180deg,transparent,var(--quiz-border-soft),transparent)]" />
        <div className="absolute inset-y-[18%] right-[18%] w-px bg-[linear-gradient(180deg,transparent,var(--quiz-border-soft),transparent)]" />
        <div className="absolute left-1/2 top-1/2 h-[38%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-[color:var(--quiz-border-strong)] opacity-55" />
      </>
    );
  }

  if (themeId === "fairy") {
    return (
      <>
        <div className="absolute inset-[12%] rounded-full border border-[color:var(--quiz-border-strong)] opacity-45" />
        <div className="absolute inset-[23%] rounded-full border border-[color:var(--quiz-border-soft)] opacity-55" />
        <div className="absolute left-1/2 top-[14%] h-[72%] w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,var(--quiz-border-soft),transparent)]" />
        <div className="absolute left-[16%] top-1/2 h-px w-[68%] -translate-y-1/2 bg-[linear-gradient(90deg,transparent,var(--quiz-accent-soft),transparent)] opacity-65" />
        <div className="absolute left-1/2 top-1/2 h-[28%] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--quiz-border-soft)] opacity-40" />
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
        <div className="absolute left-1/2 top-20 h-[min(92vw,38rem)] w-[min(92vw,38rem)] -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,244,246,0.14)_0_1px,transparent_1.5px)] bg-[length:30px_30px] opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,var(--quiz-glow-primary)_0_1px,transparent_1.5px),radial-gradient(circle_at_72%_20%,var(--quiz-glow-secondary)_0_1px,transparent_1.5px),linear-gradient(135deg,transparent_0_38%,rgba(255,241,244,0.08)_48%,transparent_58%),linear-gradient(180deg,transparent_0_18%,rgba(255,241,244,0.06)_18%_20%,transparent_20%_80%,rgba(255,241,244,0.06)_80%_82%,transparent_82%)]" />
      </>
    );
  }

  if (themeId === "fairy") {
    return (
      <>
        <div className="absolute left-1/2 top-24 h-[min(90vw,40rem)] w-[min(90vw,40rem)] -translate-x-1/2 bg-[radial-gradient(circle,rgba(243,232,210,0.12)_0_1px,transparent_1.6px)] bg-[length:36px_36px] opacity-38" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,var(--quiz-glow-secondary)_0_1px,transparent_1.5px),radial-gradient(circle_at_74%_18%,var(--quiz-glow-primary)_0_1px,transparent_1.5px),radial-gradient(circle_at_66%_72%,rgba(243,232,210,0.16)_0_1px,transparent_1.5px),radial-gradient(circle_at_32%_76%,rgba(147,182,161,0.18)_0_1px,transparent_1.5px),linear-gradient(180deg,transparent_0_24%,rgba(243,232,210,0.06)_42%,transparent_62%)]" />
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
        <div className="absolute left-[-6%] top-[10%] h-[min(72vw,26rem)] w-[min(72vw,26rem)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-primary)_0%,transparent_72%)] blur-[var(--quiz-blur-glow)]" />
        <div className="absolute bottom-[-8%] right-[-2%] h-[min(64vw,22rem)] w-[min(64vw,22rem)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-secondary)_0%,transparent_74%)] blur-[var(--quiz-blur-glow)]" />
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
        <title>Background editorial frame</title>
        <path d="M164 170H1276" stroke="var(--quiz-border-soft)" strokeDasharray="6 18" strokeWidth="1.1" />
        <path d="M164 852H1276" stroke="var(--quiz-border-soft)" strokeDasharray="6 18" strokeWidth="1.1" />
        <path d="M250 246C368 190 520 184 630 230" stroke="var(--quiz-border-soft)" strokeWidth="1.2" />
        <path d="M810 246C922 194 1082 198 1190 248" stroke="var(--quiz-border-soft)" strokeWidth="1.2" />
        <path d="M316 702C446 628 564 622 680 676" stroke="var(--quiz-border-soft)" strokeWidth="1.2" />
        <path d="M760 686C886 622 1022 626 1144 694" stroke="var(--quiz-border-soft)" strokeWidth="1.2" />
        <rect x="312" y="272" width="816" height="468" rx="32" stroke="rgba(255,244,246,0.16)" strokeWidth="1" />
        <circle cx="312" cy="272" fill="var(--quiz-accent)" r="2.4" />
        <circle cx="1128" cy="272" fill="var(--quiz-star-bright)" r="2.4" />
        <circle cx="312" cy="740" fill="var(--quiz-star-bright)" r="2.4" />
        <circle cx="1128" cy="740" fill="var(--quiz-accent-soft)" r="2.4" />
      </svg>
    );
  }

  if (themeId === "fairy") {
    return (
      <svg className="absolute inset-0 h-full w-full opacity-[0.24]" viewBox="0 0 1440 1024">
        <title>Background immortal scroll</title>
        <path d="M176 286C274 230 390 232 488 286C586 340 704 342 800 286" fill="none" stroke="var(--quiz-border-soft)" strokeWidth="1.2" />
        <path d="M828 286C928 230 1048 232 1148 286C1248 340 1326 342 1384 314" fill="none" stroke="var(--quiz-border-soft)" strokeWidth="1.2" />
        <path d="M110 736C220 680 336 684 442 736C548 788 676 790 784 736" fill="none" stroke="var(--quiz-border-soft)" strokeWidth="1.2" />
        <path d="M720 124C720 124 774 198 880 208C986 218 1034 270 1034 270" fill="none" stroke="rgba(243,232,210,0.18)" strokeDasharray="6 12" strokeWidth="1" />
        <circle cx="432" cy="286" fill="var(--quiz-accent-soft)" r="2.4" />
        <circle cx="720" cy="196" fill="var(--quiz-star-bright)" r="2.4" />
        <circle cx="1018" cy="286" fill="var(--quiz-accent)" r="2.4" />
        <circle cx="478" cy="736" fill="var(--quiz-star-bright)" r="2.4" />
        <circle cx="850" cy="736" fill="var(--quiz-accent-soft)" r="2.4" />
        <circle cx="1058" cy="640" fill="var(--quiz-accent)" r="2.4" />
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
      ? "absolute left-1/2 top-[9%] h-[min(94vw,46rem)] w-[min(94vw,46rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(239,192,203,0.16)_0%,transparent_64%)] blur-[calc(var(--quiz-blur-glow)*1.04)]"
      : themeId === "fairy"
        ? "absolute left-1/2 top-[7%] h-[min(96vw,48rem)] w-[min(96vw,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(147,182,161,0.18)_0%,transparent_66%)] blur-[calc(var(--quiz-blur-glow)*1.08)]"
        : "absolute left-1/2 top-[8%] h-[min(96vw,48rem)] w-[min(96vw,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(151,183,202,0.18)_0%,transparent_64%)] blur-[calc(var(--quiz-blur-glow)*1.08)]";
  const frameClassName =
    themeId === "movie"
      ? "absolute left-1/2 top-10 h-[min(84vw,32rem)] w-[min(86vw,40rem)] -translate-x-1/2 rounded-[2.6rem] border border-[color:var(--quiz-border-strong)] opacity-45"
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
