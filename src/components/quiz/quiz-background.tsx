"use client";

import { motion, useReducedMotion } from "motion/react";

export function QuizBackground() {
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
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={veilAnimation}
        className="absolute left-1/2 top-[8%] h-[min(96vw,48rem)] w-[min(96vw,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(151,183,202,0.18)_0%,transparent_64%)] blur-[calc(var(--quiz-blur-glow)*1.08)]"
        style={{ willChange: "transform, opacity" }}
        transition={{ duration: 34, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />

      <motion.div
        animate={orbitAnimation}
        className="absolute left-1/2 top-8 h-[var(--quiz-orbit-size)] w-[var(--quiz-orbit-size)] -translate-x-1/2 rounded-full border border-[color:var(--quiz-border-strong)] opacity-40"
        style={{ willChange: "transform, opacity" }}
        transition={{ duration: 38, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="absolute inset-[var(--quiz-orbit-inset-md)] rounded-full border border-[color:var(--quiz-border-soft)]" />
        <div className="absolute inset-[var(--quiz-orbit-inset-sm)] rounded-full border border-[color:var(--quiz-border-soft)]" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(216,181,127,0.3),transparent)]" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(151,183,202,0.22),transparent)]" />
      </motion.div>

      <motion.div
        animate={fieldAnimation}
        className="absolute inset-0 opacity-45"
        style={{ willChange: "transform, opacity" }}
        transition={{ duration: 30, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="absolute left-1/2 top-24 h-[var(--quiz-dots-size)] w-[var(--quiz-dots-size)] -translate-x-1/2 bg-[radial-gradient(circle,var(--quiz-star-bright)_0_1px,transparent_1.5px)] bg-[length:var(--quiz-dot-grid-size)_var(--quiz-dot-grid-size)] opacity-65" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,var(--quiz-glow-primary)_0_1px,transparent_1.5px),radial-gradient(circle_at_74%_18%,var(--quiz-glow-secondary)_0_1px,transparent_1.5px),radial-gradient(circle_at_68%_72%,var(--quiz-star-soft)_0_1px,transparent_1.5px),radial-gradient(circle_at_32%_78%,rgba(216,181,127,0.14)_0_1px,transparent_1.5px)]" />
      </motion.div>

      <div className="absolute inset-0 opacity-50">
        <div className="absolute left-[var(--quiz-glow-primary-left)] top-[var(--quiz-glow-primary-top)] h-[var(--quiz-glow-size-lg)] w-[var(--quiz-glow-size-lg)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-primary)_0%,transparent_72%)] blur-[var(--quiz-blur-glow)]" />
        <div className="absolute bottom-[var(--quiz-glow-secondary-bottom)] right-[var(--quiz-glow-secondary-right)] h-[var(--quiz-glow-size-sm)] w-[var(--quiz-glow-size-sm)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-secondary)_0%,transparent_74%)] blur-[var(--quiz-blur-glow)]" />
      </div>

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.26]"
        viewBox="0 0 1440 1024"
      >
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
    </div>
  );
}
