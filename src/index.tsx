import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useSnapshot } from 'valtio';

// Geist — self-hosted via @fontsource (no external request).
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';

import './index.css';
import App from './App';
import { queryClient } from './lib/queryClient';
import { initTheme, themeState } from './lib/theme';

initTheme();

function AppRoot(): React.ReactElement {
  const snap = useSnapshot(themeState);
  return (
    <>
      <App />
      <Toaster
        theme={snap.theme as 'dark' | 'light'}
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10, 14, 26, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f4f4f5',
            backdropFilter: 'blur(18px) saturate(140%)',
          },
        }}
      />
    </>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoot />
    </QueryClientProvider>
  </React.StrictMode>
);
