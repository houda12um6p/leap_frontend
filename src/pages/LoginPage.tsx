import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOKENS, FONT } from '../styles/tokens';
import { Logo } from '../components/ui/Logo';
import { Field } from '../components/ui/Field';
import { PrimaryButton } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%', height: '100vh',
      background: TOKENS.bg, fontFamily: FONT,
      position: 'relative', overflow: 'hidden',
      display: 'grid', placeItems: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
      } as React.CSSProperties} />
      <div style={{ position: 'absolute', top: 28, left: 32 }}>
        <Logo />
      </div>
      {children}
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!email || !pw) { setErr('Email and password are required.'); return; }
    setLoading(true);
    try {
      await login(email, pw);
      navigate('/');
    } catch {
      setErr('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <form onSubmit={submit} style={{
        width: 420,
        background: TOKENS.bgElev,
        border: `1px solid ${TOKENS.border}`,
        borderRadius: 14,
        padding: '36px 36px 30px',
        position: 'relative',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
      }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, color: TOKENS.text, fontSize: 24, fontWeight: 600, letterSpacing: -0.5 }}>
            Welcome back
          </h1>
        </div>

        <div style={{ display: 'grid', gap: 16, marginBottom: 22 }}>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@ocp.ma" autoFocus />
          <div>
            <Field label="Password" type="password" value={pw} onChange={setPw} placeholder="••••••••" />
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <span style={{ color: TOKENS.textDim, fontSize: 11.5 }}>Forgot password?</span>
            </div>
          </div>
        </div>

        {err && (
          <div style={{
            padding: '8px 11px', background: TOKENS.dangerSoft,
            border: `1px solid ${TOKENS.danger}40`, borderRadius: 7,
            color: TOKENS.danger, fontSize: 12, marginBottom: 14,
          }}>{err}</div>
        )}

        <PrimaryButton type="submit" full disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </PrimaryButton>

        <div style={{
          marginTop: 22, paddingTop: 18,
          borderTop: `1px solid ${TOKENS.border}`,
          textAlign: 'center', fontSize: 13, color: TOKENS.textDim,
        }}>
          New to LEAP?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ color: TOKENS.accent, fontWeight: 500, cursor: 'pointer' }}
          >Create an account →</span>
        </div>
      </form>
    </AuthShell>
  );
}
