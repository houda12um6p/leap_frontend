import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { sessionState } from '../store';
import { authState } from '../lib/auth';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.25,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.0,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const meta: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 1.4, delay: 1.4, ease: 'easeOut' },
  },
};

export default function Welcome() {
  const handleEnter = () => {
    sessionState.hasEnteredApp = true;
  };

  // Read-only snapshot so the component re-renders if state changes.
  useSnapshot(sessionState);
  const auth = useSnapshot(authState);
  const ctaTarget = auth.token && auth.user ? '/dashboard' : '/login';
  const ctaLabel  = auth.token && auth.user ? 'Enter dashboard' : 'Sign in';

  return (
    <main className="welcome-shell">
      <motion.section
        className="welcome-stage"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="welcome-eyebrow" variants={item}>
          <span className="dot" />
          OCPS &nbsp;//&nbsp; v0.1 &nbsp;//&nbsp; Engineering Intelligence
        </motion.div>

        <motion.h1 className="welcome-title" variants={item}>
          OCPS&nbsp;<em>LEAP</em>
        </motion.h1>

        <motion.p className="welcome-subtitle" variants={item}>
          Engineering Intelligence Command. <br />
          A live signal layer over your commits, merge requests and Jira flow —
          surfaced with calm, deliberate clarity.
        </motion.p>

        <motion.div variants={item}>
          <Link
            to={ctaTarget}
            className="welcome-cta"
            onClick={handleEnter}
            aria-label={ctaLabel}
          >
            <span>{ctaLabel}</span>
            <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </motion.section>

      <motion.div
        className="welcome-meta"
        variants={meta}
        initial="hidden"
        animate="show"
        aria-hidden="true"
      >
        <span>OCPS / LEAP</span>
        <span>· · ·</span>
        <span>Build 0.1 · 2026</span>
      </motion.div>
    </main>
  );
}
