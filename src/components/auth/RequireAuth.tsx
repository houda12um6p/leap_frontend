import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import { authState } from '../../lib/auth';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const snap = useSnapshot(authState);
  const location = useLocation();
  if (!snap.token || !snap.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
