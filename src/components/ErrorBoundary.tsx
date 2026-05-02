import React from 'react';
import { TOKENS, FONT, FONT_MONO } from '../styles/tokens';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('UI crashed:', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        width: '100%', height: '100vh',
        background: TOKENS.bg, color: TOKENS.text,
        display: 'grid', placeItems: 'center',
        fontFamily: FONT, padding: 20,
      }}>
        <div style={{
          maxWidth: 460, width: '100%',
          background: TOKENS.bgElev,
          border: `1px solid ${TOKENS.danger}40`,
          borderLeft: `4px solid ${TOKENS.danger}`,
          borderRadius: 12,
          padding: 24,
        }}>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1.2,
            color: TOKENS.danger, textTransform: 'uppercase', marginBottom: 8,
          }}>Something went wrong</div>
          <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 600 }}>
            The interface hit an error.
          </h2>
          <p style={{ margin: '0 0 16px', color: TOKENS.textDim, fontSize: 13.5, lineHeight: 1.5 }}>
            You can try again. If this keeps happening, refresh the page or sign out and back in.
          </p>
          {this.state.error.message && (
            <pre style={{
              background: 'rgba(0,0,0,0.25)', borderRadius: 8,
              padding: 10, color: TOKENS.textDim,
              fontFamily: FONT_MONO, fontSize: 11.5,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              marginBottom: 16, maxHeight: 140, overflow: 'auto',
            }}>{this.state.error.message}</pre>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={this.reset} style={{
              padding: '9px 16px', background: TOKENS.accent, color: '#03130A',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: FONT,
            }}>Try again</button>
            <button onClick={() => window.location.reload()} style={{
              padding: '9px 16px', background: 'transparent', color: TOKENS.textDim,
              border: `1px solid ${TOKENS.border}`, borderRadius: 8,
              fontSize: 13, cursor: 'pointer', fontFamily: FONT,
            }}>Reload page</button>
          </div>
        </div>
      </div>
    );
  }
}
