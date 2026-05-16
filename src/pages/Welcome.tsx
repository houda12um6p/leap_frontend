import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import { motion, Variants } from 'framer-motion';
import { sessionState } from '../store';
import { authState } from '../lib/auth';
import { HelmMark } from '../components/HelmMark';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function Welcome() {
  const navigate = useNavigate();
  useSnapshot(sessionState);
  const auth = useSnapshot(authState);
  const target = auth.token && auth.user ? '/dashboard' : '/login';
  const label  = auth.token && auth.user ? 'Enter dashboard' : 'Sign in';

  const handleCta = () => {
    sessionState.hasEnteredApp = true;
    navigate(target);
  };

  return (
    <motion.div
      className="welcome-root"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="welcome-center">
        <HelmMark size={140} layoutId="helm-mark" />

        <motion.div
          className="welcome-wordmark"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {'HELM'.split('').map((ch, i) => (
            <motion.span key={i} variants={item}>{ch}</motion.span>
          ))}
        </motion.div>

        <motion.p
          className="welcome-tagline"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Intelligent Project Tracking
        </motion.p>

        <motion.button
          className="welcome-cta"
          onClick={handleCta}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{label}</span>
          <span className="arrow" aria-hidden="true">→</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
