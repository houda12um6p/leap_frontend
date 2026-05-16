import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCreateProject } from '../../lib/api';
import { useSnapshot } from 'valtio';
import { dashboardState, closeAddProject } from '../../store';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--leap-border)',
  background: 'var(--leap-card-bg)',
  color: 'var(--leap-text)',
  fontFamily: "'Geist', system-ui",
  fontSize: 14,
  letterSpacing: '-0.005em',
  outline: 'none',
  transition: 'border-color 200ms ease, background 200ms ease',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Geist Mono', monospace",
  fontSize: 10,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--leap-text-faint)',
  marginBottom: 8,
};

export function AddProjectModal() {
  const snap = useSnapshot(dashboardState);
  const create = useCreateProject();
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setRepo('');
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError('Project name is required.');
    if (!repo.trim()) return setError('Repository URL is required.');
    try {
      await create.mutateAsync({ name: name.trim(), repo_url: repo.trim() });
      toast.success(`Added ${name.trim()}`);
      closeAddProject();
      reset();
    } catch (e) {
      setError((e as Error)?.message || 'Could not create project.');
    }
  };

  return (
    <Modal
      open={snap.isAddProjectOpen}
      onClose={() => { closeAddProject(); reset(); }}
      title="Add a new project"
    >
      <label style={labelStyle}>Project name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Insights Web"
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.55)'; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--leap-border)'; }}
      />

      <div style={{ height: 14 }} />

      <label style={labelStyle}>Repository URL</label>
      <input
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
        placeholder="https://github.com/your-org/your-repo"
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.55)'; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--leap-border)'; }}
      />

      {error && (
        <div style={{
          marginTop: 14, padding: '8px 12px',
          borderRadius: 8,
          background: 'rgba(248, 113, 113, 0.08)',
          color: '#fca5a5',
          fontFamily: "'Geist Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.05em',
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 22, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="md" onClick={() => { closeAddProject(); reset(); }}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={submit}
          disabled={create.isPending}
        >
          {create.isPending ? 'Adding…' : 'Add project'}
        </Button>
      </div>
    </Modal>
  );
}
