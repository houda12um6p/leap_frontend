import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUpdateProject } from '../../lib/api';
import type { Project } from '../../lib/types';

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

interface Props {
  open: boolean;
  project: Project;
  onClose: () => void;
}

export function EditProjectModal({ open, project, onClose }: Props) {
  const update = useUpdateProject();
  const [name, setName] = useState(project.name);
  const [repo, setRepo] = useState(project.repo_url);
  const [status, setStatus] = useState<'active' | 'archived'>(project.status);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(project.name);
      setRepo(project.repo_url);
      setStatus(project.status);
      setError(null);
    }
  }, [open, project]);

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError('Project name is required.');
    if (!repo.trim()) return setError('Repository URL is required.');
    try {
      await update.mutateAsync({
        id: project.id,
        name: name.trim(),
        repo_url: repo.trim(),
        status,
      });
      toast.success(`Updated ${name.trim()}`);
      onClose();
    } catch (e) {
      setError((e as Error).message ?? 'Could not update project.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit project">
      <p style={{
        margin: '0 0 18px',
        color: 'var(--leap-text-dim)',
        fontSize: 13, lineHeight: 1.5,
      }}>
        Adjust the project name, repository URL or status. Changes are pushed via PATCH&nbsp;/projects/&#123;id&#125;.
      </p>

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

      <div style={{ height: 14 }} />

      <label style={labelStyle}>Status</label>
      <div role="radiogroup" style={{ display: 'flex', gap: 8 }}>
        {(['active', 'archived'] as const).map((s) => {
          const selected = status === s;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setStatus(s)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${selected ? 'rgba(94, 234, 212, 0.55)' : 'var(--leap-border)'}`,
                background: selected ? 'rgba(94, 234, 212, 0.08)' : 'var(--leap-card-bg)',
                color: selected ? 'var(--leap-text)' : 'var(--leap-text-dim)',
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 200ms ease, border-color 200ms ease, color 200ms ease',
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

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
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          size="md"
          onClick={submit}
          disabled={update.isPending}
        >
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </Modal>
  );
}
