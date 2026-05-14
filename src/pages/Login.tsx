import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { toast } from 'sonner';
import { login, register } from '../lib/auth';
import { forgotPassword } from '../lib/api';
import { Button } from '../components/ui/Button';
import { ArrowRightIcon } from '../components/ui/Icon';

const container: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.10, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotSent, setForgotSent]     = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const submit = async () => {
    if (!email.trim() || !password) {
      toast.error('Email and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        toast.success('Welcome back.');
      } else {
        if (!name.trim()) { toast.error('Name is required.'); setSubmitting(false); return; }
        await register(name.trim(), email.trim(), password);
        toast.success('Account created.');
      }
      navigate(redirectTo, { replace: true });
    } catch (e) {
      toast.error((e as Error).message || (mode === 'login' ? 'Login failed.' : 'Registration failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitForgot = async () => {
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
    } catch {
      // intentional: always show success regardless of error (no email enumeration)
    } finally {
      setForgotLoading(false);
      setForgotSent(true);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (view === 'forgot') {
        if (!forgotSent && forgotEmail.trim()) submitForgot();
      } else {
        submit();
      }
    }
  };

  return (
    <main className="welcome-shell" onKeyDown={onKeyDown}>
      <motion.section
        key={view}
        className="welcome-stage"
        variants={container}
        initial="hidden"
        animate="show"
        style={{ width: 'min(440px, 100%)' }}
      >
        {view === 'forgot' ? (
          <>
            <motion.h1
              variants={item}
              style={{
                margin: 0,
                fontFamily: "'Geist', system-ui",
                fontWeight: 600,
                fontSize: 'clamp(32px, 5vw, 52px)',
                letterSpacing: '-0.045em',
                lineHeight: 0.95,
                background: 'linear-gradient(180deg, var(--leap-text) 0%, var(--leap-text-dim) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
              }}
            >
              Forgot password
            </motion.h1>

            <motion.p
              variants={item}
              style={{
                margin: 0,
                textAlign: 'center',
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--leap-text-dim)',
                maxWidth: 360,
              }}
            >
              Enter your email address to receive reset instructions.
            </motion.p>

            {!forgotSent ? (
              <>
                <motion.div variants={item} style={{ width: '100%' }}>
                  <FloatingField
                    label="Email"
                    type="email"
                    value={forgotEmail}
                    onChange={setForgotEmail}
                    autoFocus
                    autoComplete="email"
                  />
                </motion.div>

                <motion.div variants={item} style={{ width: '100%' }}>
                  <Button
                    variant="primary"
                    size="lg"
                    block
                    onClick={submitForgot}
                    disabled={forgotLoading || !forgotEmail.trim()}
                    trailing={<ArrowRightIcon size={14} />}
                  >
                    {forgotLoading ? 'Sending…' : 'Send'}
                  </Button>
                </motion.div>

                <motion.div variants={item} style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  color: 'var(--leap-text-faint)',
                }}>
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    style={linkButton}
                  >
                    Back to login
                  </button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  variants={item}
                  style={{
                    width: '100%',
                    padding: '16px 18px',
                    borderRadius: 12,
                    border: '1px solid rgba(94, 234, 212, 0.45)',
                    background: 'rgba(94, 234, 212, 0.08)',
                    color: 'var(--leap-text)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontFamily: "'Geist', system-ui",
                    letterSpacing: '-0.005em',
                  }}
                >
                  If this address exists, you will receive an email with reset instructions.
                </motion.div>

                <motion.div variants={item} style={{ width: '100%' }}>
                  <Button
                    variant="primary"
                    size="lg"
                    block
                    onClick={() => { setView('login'); setForgotSent(false); setForgotEmail(''); }}
                  >
                    Back to login
                  </Button>
                </motion.div>
              </>
            )}
          </>
        ) : (
          <>
            <motion.h1
              variants={item}
              style={{
                margin: 0,
                fontFamily: "'Geist', system-ui",
                fontWeight: 600,
                fontSize: 'clamp(40px, 6.4vw, 72px)',
                letterSpacing: '-0.045em',
                lineHeight: 0.95,
                background: 'linear-gradient(180deg, var(--leap-text) 0%, var(--leap-text-dim) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
              }}
            >
              {mode === 'login' ? <>Welcome <em style={italicAccent}>back</em>.</> : <>Join <em style={italicAccent}>LEAP</em>.</>}
            </motion.h1>

            <motion.div variants={item} style={{ width: '100%' }}>
              {mode === 'register' && (
                <FloatingField
                  label="Full name"
                  type="text"
                  value={name}
                  onChange={setName}
                  autoFocus
                />
              )}
              <FloatingField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoFocus={mode === 'login'}
                autoComplete="email"
              />
              <FloatingField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: 12,
                      color: 'var(--leap-text-faint)',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      padding: 0,
                      fontFamily: "'Geist Mono', monospace",
                      letterSpacing: '0.06em',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </motion.div>

            <motion.div variants={item} style={{ width: '100%' }}>
              <Button
                variant="primary"
                size="lg"
                block
                onClick={submit}
                disabled={submitting}
                trailing={<ArrowRightIcon size={14} />}
              >
                {submitting
                  ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                  : (mode === 'login' ? 'Sign in' : 'Create account')}
              </Button>
            </motion.div>

            <motion.div variants={item} style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.10em',
              color: 'var(--leap-text-faint)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {mode === 'login' ? (
                <>
                  <span>No account?</span>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    style={linkButton}
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  <span>Already have one?</span>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={linkButton}
                  >
                    Sign in
                  </button>
                </>
              )}
              <span style={{ opacity: 0.4 }}>·</span>
              <Link to="/" style={linkButton as React.CSSProperties}>Back home</Link>
            </motion.div>
          </>
        )}
      </motion.section>
    </main>
  );
}

const italicAccent: React.CSSProperties = {
  fontFamily: "'Instrument Serif', serif",
  fontStyle: 'italic',
  fontWeight: 400,
  background: 'linear-gradient(180deg, var(--leap-accent-cyan) 0%, var(--leap-accent-amber) 130%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const linkButton: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'var(--leap-text)',
  textDecoration: 'underline',
  textUnderlineOffset: 4,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  letterSpacing: 'inherit',
  padding: 0,
};

/* ----------------------------- FloatingField ------------------------- */

interface FloatingFieldProps {
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  autoComplete?: string;
}

function FloatingField({ label, type, value, onChange, autoFocus, autoComplete }: FloatingFieldProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: 12,
        borderRadius: 12,
        border: `1px solid ${focused ? 'rgba(94, 234, 212, 0.55)' : 'var(--leap-border)'}`,
        background: 'var(--leap-input-bg)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        transition: 'border-color 220ms ease, box-shadow 240ms ease',
        boxShadow: focused ? '0 0 0 3px rgba(94, 234, 212, 0.10)' : 'none',
      }}
    >
      <label
        style={{
          position: 'absolute',
          left: 14,
          top: lifted ? 6  : 18,
          fontSize: lifted ? 10 : 13,
          fontFamily: lifted ? "'Geist Mono', monospace" : "'Geist', system-ui",
          letterSpacing: lifted ? '0.18em' : '-0.005em',
          textTransform: lifted ? 'uppercase' : 'none',
          color: lifted ? 'var(--leap-text-faint)' : 'var(--leap-text-dim)',
          pointerEvents: 'none',
          transition: 'all 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '24px 14px 10px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--leap-text)',
          fontFamily: "'Geist', system-ui",
          fontSize: 14,
          letterSpacing: '-0.005em',
        }}
      />
    </div>
  );
}
