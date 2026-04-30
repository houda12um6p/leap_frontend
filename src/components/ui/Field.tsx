import React, { useState } from 'react';
import { TOKENS, FONT, FONT_MONO } from '../../styles/tokens';

interface FieldProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function Field({ label, type = 'text', value, onChange, placeholder, autoFocus }: FieldProps) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: 'block', fontFamily: FONT }}>
      <div style={{
        fontSize: 11, color: TOKENS.textDim, marginBottom: 7,
        fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase',
        fontFamily: FONT_MONO,
      }}>
        {label}
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          padding: '11px 13px',
          background: '#081832',
          border: `1px solid ${focus ? TOKENS.borderStrong : TOKENS.border}`,
          borderRadius: 8,
          color: TOKENS.text,
          fontSize: 14,
          fontFamily: FONT,
          outline: 'none',
          transition: 'border-color 0.15s',
          boxSizing: 'border-box',
        }}
      />
    </label>
  );
}
