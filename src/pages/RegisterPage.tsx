import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOKENS, FONT, FONT_MONO } from '../styles/tokens';
import { Logo } from '../components/ui/Logo';
import { Field } from '../components/ui/Field';
import { PrimaryButton } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: TOKENS.bg, fontFamily: FONT,
      position: 'relative', overflow: 'hidden',
      display: 'grid', placeItems: 'center',
      padding: 14,
    }}>
      <div aria-hidden style={{
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

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, pw: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const strength = (() => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  })();
  const strLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strColors = ['', TOKENS.danger, TOKENS.warn, TOKENS.med, TOKENS.accent];

  const nameErr  = touched.name  && !name ? 'Full name is required.' : '';
  const emailErr = touched.email && !email ? 'Email is required.'
    : touched.email && !EMAIL_RE.test(email) ? 'Enter a valid email address.' : '';
  const pwErr    = touched.pw    && pw.length < 8 ? 'Password must be at least 8 characters.' : '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setTouched({ name: true, email: true, pw: true });
    if (!name) return;
    if (!email || !EMAIL_RE.test(email)) return;
    if (pw.length < 8) return;
    setLoading(true);
    try {
      await register(name, email, pw);
      navigate('/login');
    } catch {
      setErr('Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <form onSubmit={submit} className="leap-auth-card" noValidate style={{
        width: 420,
        background: TOKENS.bgElev,
        border: `1px solid ${TOKENS.border}`,
        borderRadius: 14,
        padding: '36px 36px 30px',
        position: 'relative',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
      }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, color: TOKENS.text, fontSize: 24, fontWeight: 600, letterSpacing: -0.5 }}>
            Create your account
          </h1>
        </div>

        <div style={{ display: 'grid', gap: 14, marginBottom: 18 }}>
          <Field
            label="Full name" autoComplete="name"
            value={name}
            onChange={(v) => { setName(v); if (!touched.name) setTouched(t => ({ ...t, name: true })); }}
            placeholder="Imane El Khattabi" autoFocus
            error={nameErr}
            required
          />
          <Field
            label="Email" type="email" autoComplete="email"
            value={email}
            onChange={(v) => { setEmail(v); if (!touched.email) setTouched(t => ({ ...t, email: true })); }}
            placeholder="you@ocp.ma"
            error={emailErr}
            required
          />
          <div>
            <Field
              label="Password" type="password" autoComplete="new-password"
              value={pw}
              onChange={(v) => { setPw(v); if (!touched.pw) setTouched(t => ({ ...t, pw: true })); }}
              placeholder="At least 8 characters"
              hint={!pwErr ? 'Use 8+ chars with a number and symbol for a stronger password.' : undefined}
              error={pwErr}
              required
            />
            {pw.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= strength ? strColors[strength] : 'rgba(255,255,255,0.08)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 10.5, color: strColors[strength] || TOKENS.textFaint, fontFamily: FONT_MONO, minWidth: 44, textAlign: 'right' }}>
                  {strLabels[strength]}
                </div>
              </div>
            )}
          </div>
        </div>

        {err && (
          <div role="alert" style={{
            padding: '8px 11px', background: TOKENS.dangerSoft,
            border: `1px solid ${TOKENS.danger}40`, borderRadius: 7,
            color: TOKENS.danger, fontSize: 12, marginBottom: 14,
          }}>{err}</div>
        )}

        <PrimaryButton type="submit" full loading={loading}>
          {loading ? 'Creating…' : 'Create Account'}
        </PrimaryButton>

        <div style={{
          marginTop: 18, paddingTop: 16,
          borderTop: `1px solid ${TOKENS.border}`,
          textAlign: 'center', fontSize: 13, color: TOKENS.textDim,
        }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ background: 'transparent', border: 'none', color: TOKENS.accent, fontWeight: 500, cursor: 'pointer', font: 'inherit', padding: 0 }}
          >Sign in →</button>
        </div>
      </form>
    </AuthShell>
  );
}
