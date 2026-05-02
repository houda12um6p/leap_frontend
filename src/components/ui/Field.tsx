import React, { useId, useState } from 'react';
import { TOKENS, FONT, FONT_MONO } from '../../styles/tokens';

interface FieldProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function Field({
  label, type = 'text', value, onChange, placeholder,
  autoFocus, autoComplete, error, hint, required,
}: FieldProps) {
  const [focus, setFocus] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div style={{ display: 'block', fontFamily: FONT }}>
      <label htmlFor={id} style={{
        display: 'block',
        fontSize: 11, color: TOKENS.textDim, marginBottom: 7,
        fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase',
        fontFamily: FONT_MONO,
      }}>
        {label}{required ? ' *' : ''}
      </label>
      <input
        id={id}
        type={type}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          padding: '11px 13px',
          background: '#081832',
          border: `1px solid ${error ? TOKENS.danger : (focus ? TOKENS.borderStrong : TOKENS.border)}`,
          borderRadius: 8,
          color: TOKENS.text,
          fontSize: 14,
          fontFamily: FONT,
          outline: 'none',
          transition: 'border-color 0.15s',
          boxSizing: 'border-box',
        }}
      />
      {error && (
        <div id={errorId} role="alert" style={{
          fontSize: 11.5, color: TOKENS.danger, marginTop: 5, fontFamily: FONT,
        }}>{error}</div>
      )}
      {!error && hint && (
        <div id={hintId} style={{
          fontSize: 11.5, color: TOKENS.textFaint, marginTop: 5, fontFamily: FONT,
        }}>{hint}</div>
      )}
    </div>
  );
}
