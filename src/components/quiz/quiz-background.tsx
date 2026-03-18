"use client";

import { motion, useReducedMotion } from "motion/react";

export function QuizBackground() {
  const prefersReducedMotion = useReducedMotion();

  const orbitAnimation = prefersReducedMotion
    ? undefined
    : {
        opacity: [0.42, 0.64, 0.42],
        rotate: [0, 10, -8, 0],
        scale: [1, 1.03, 0.98, 1],
      };
  const dotAnimation = prefersReducedMotion
    ? undefined
    : {
        opacity: [0.22, 0.44, 0.22],
        x: [0, 14, -10, 0],
        y: [0, 18, -12, 0],
      };
  const glowAnimation = prefersReducedMotion
    ? undefined
    : {
        opacity: [0.28, 0.48, 0.3],
        scale: [1, 1.06, 0.98, 1],
        x: [0, -10, 12, 0],
        y: [0, 12, -8, 0],
      };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={orbitAnimation}
        className="absolute left-1/2 top-6 h-[var(--quiz-orbit-size)] w-[var(--quiz-orbit-size)] -translate-x-1/2 rounded-full border border-[color:var(--quiz-border-strong)] opacity-50"
        style={{ willChange: "transform, opacity" }}
        transition={{ duration: 28, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="absolute inset-[var(--quiz-orbit-inset-md)] rounded-full border border-[color:var(--quiz-border-soft)]" />
        <div className="absolute inset-[var(--quiz-orbit-inset-sm)] rounded-full border border-[color:var(--quiz-border-soft)]" />
      </motion.div>

      <motion.div
        animate={dotAnimation}
        className="absolute inset-0 opacity-40"
        style={{ willChange: "transform, opacity" }}
        transition={{ duration: 22, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      >
        <div
          className="absolute left-1/2 top-24 h-[var(--quiz-dots-size)] w-[var(--quiz-dots-size)] -translate-x-1/2 bg-[radial-gradient(circle,var(--quiz-star-bright)_0_1px,transparent_1.5px)] bg-[length:var(--quiz-dot-grid-size)_var(--quiz-dot-grid-size)]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,var(--quiz-glow-primary)_0_1px,transparent_1.5px),radial-gradient(circle_at_76%_18%,var(--quiz-glow-secondary)_0_1px,transparent_1.5px),radial-gradient(circle_at_70%_72%,var(--quiz-star-soft)_0_1px,transparent_1.5px)]" />
      </motion.div>

      <motion.div
        animate={glowAnimation}
        className="absolute inset-0 opacity-45"
        style={{ willChange: "transform, opacity" }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="absolute left-[var(--quiz-glow-primary-left)] top-[var(--quiz-glow-primary-top)] h-[var(--quiz-glow-size-lg)] w-[var(--quiz-glow-size-lg)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-primary)_0%,transparent_70%)] blur-[var(--quiz-blur-glow)]" />
        <div className="absolute bottom-[var(--quiz-glow-secondary-bottom)] right-[var(--quiz-glow-secondary-right)] h-[var(--quiz-glow-size-sm)] w-[var(--quiz-glow-size-sm)] rounded-full bg-[radial-gradient(circle,var(--quiz-glow-secondary)_0%,transparent_72%)] blur-[var(--quiz-blur-glow)]" />
      </motion.div>
    </div>
  );
}
