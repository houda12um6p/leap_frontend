import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Callout } from '../ui/Callout';
import { useUpdateProject, UpdateProjectInput } from '../../lib/api';
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

const sectionHeaderStyle: React.CSSProperties = {
  marginTop: 24,
  paddingTop: 18,
  borderTop: '1px solid var(--leap-border-soft)',
  fontFamily: "'Geist Mono', monospace",
  fontSize: 10,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: 'var(--leap-text-faint)',
  marginBottom: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};

interface Props {
  open: boolean;
  project: Project;
  onClose: () => void;
}

const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.55)';
};
const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'var(--leap-border)';
};

export function EditProjectModal({ open, project, onClose }: Props) {
  const update = useUpdateProject();
  const [name, setName] = useState(project.name);
  const [repo, setRepo] = useState(project.repo_url);
  const [jiraKey, setJiraKey] = useState(project.jira_key ?? '');
  const [jiraUrl, setJiraUrl] = useState(project.jira_base_url ?? '');
  const [jiraEmail, setJiraEmail] = useState(project.jira_email ?? '');
  const [jiraToken, setJiraToken] = useState('');
  const [tokenDirty, setTokenDirty] = useState(false);
  const [status, setStatus] = useState<'active' | 'archived'>(project.status);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(project.name);
      setRepo(project.repo_url);
      setJiraKey(project.jira_key ?? '');
      setJiraUrl(project.jira_base_url ?? '');
      setJiraEmail(project.jira_email ?? '');
      setJiraToken('');
      setTokenDirty(false);
      setStatus(project.status);
      setError(null);
    }
  }, [open, project]);

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError('Project name is required.');
    if (!repo.trim()) return setError('Repository URL is required.');

    const patch: UpdateProjectInput = {
      id: project.id,
      name: name.trim(),
      repo_url: repo.trim(),
      jira_key:      jiraKey.trim()   ? jiraKey.trim()   : null,
      jira_base_url: jiraUrl.trim()   ? jiraUrl.trim()   : null,
      jira_email:    jiraEmail.trim() ? jiraEmail.trim() : null,
      status,
    };
    if (tokenDirty) {
      patch.jira_api_token = jiraToken.trim() ? jiraToken.trim() : null;
    }

    try {
      await update.mutateAsync(patch);
      toast.success(`Updated ${name.trim()}`);
      onClose();
    } catch (e) {
      setError((e as Error).message ?? 'Could not update project.');
    }
  };

  const tokenAlreadySet = project.jira_api_token_set;
  const tokenPlaceholder = tokenAlreadySet ? '•••••••••••••••• (configured)' : 'paste your Jira API token';

  return (
    <Modal open={open} onClose={onClose} title="Edit project">
      <p style={{
        margin: '0 0 18px',
        color: 'var(--leap-text-dim)',
        fontSize: 13, lineHeight: 1.5,
      }}>
        Adjust the project name, repository URL, status, and the Jira connection used to
        sync issues for this project.
      </p>

      <label style={labelStyle}>Project name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Insights Web"
        style={inputStyle}
        onFocus={focusBorder}
        onBlur={blurBorder}
      />

      <div style={{ height: 14 }} />

      <label style={labelStyle}>Repository URL</label>
      <input
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
        placeholder="https://github.com/your-org/your-repo"
        style={inputStyle}
        onFocus={focusBorder}
        onBlur={blurBorder}
      />

      {/* --- Jira connection --- */}
      <div style={sectionHeaderStyle}>
        <span style={{
          width: 6, height: 6, borderRadius: 999,
          background: 'var(--leap-accent-cyan)',
          boxShadow: '0 0 8px color-mix(in srgb, var(--leap-accent-cyan) 50%, transparent)',
        }} />
        Jira connection
      </div>

      <label style={labelStyle}>Jira base URL</label>
      <input
        value={jiraUrl}
        onChange={(e) => setJiraUrl(e.target.value)}
        placeholder="https://your-org.atlassian.net"
        autoComplete="off"
        spellCheck={false}
        style={inputStyle}
        onFocus={focusBorder}
        onBlur={blurBorder}
      />

      <div style={{ height: 14 }} />

      <label style={labelStyle}>Jira email</label>
      <input
        value={jiraEmail}
        onChange={(e) => setJiraEmail(e.target.value)}
        placeholder="you@your-org.com"
        type="email"
        autoComplete="off"
        spellCheck={false}
        style={inputStyle}
        onFocus={focusBorder}
        onBlur={blurBorder}
      />

      <div style={{ height: 14 }} />

      <label style={labelStyle}>
        Jira API token
        {tokenAlreadySet && !tokenDirty && (
          <span style={{
            marginLeft: 8,
            padding: '1px 6px',
            borderRadius: 4,
            background: 'color-mix(in srgb, var(--leap-accent-cyan) 14%, transparent)',
            color: 'var(--leap-accent-cyan)',
            letterSpacing: '0.16em',
          }}>
            configured
          </span>
        )}
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={jiraToken}
          onChange={(e) => { setJiraToken(e.target.value); setTokenDirty(true); }}
          placeholder={tokenPlaceholder}
          type="password"
          autoComplete="new-password"
          spellCheck={false}
          style={{ ...inputStyle, flex: 1, minWidth: 0 }}
          onFocus={focusBorder}
          onBlur={blurBorder}
        />
        {tokenAlreadySet && (
          <button
            type="button"
            onClick={() => { setJiraToken(''); setTokenDirty(true); }}
            title="Clear stored token"
            style={{
              padding: '0 14px',
              borderRadius: 10,
              border: '1px solid var(--leap-border)',
              background: 'var(--leap-surface-soft)',
              color: 'var(--leap-text-dim)',
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div style={{ height: 14 }} />

      <label style={labelStyle}>Jira project key</label>
      <input
        value={jiraKey}
        onChange={(e) => setJiraKey(e.target.value.toUpperCase())}
        placeholder="e.g. LEAP"
        autoCapitalize="characters"
        spellCheck={false}
        style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '0.04em' }}
        onFocus={focusBorder}
        onBlur={blurBorder}
      />

      <div style={{ height: 12 }} />

      <Callout tone="warning" title="PR title convention">
        For clean synchronization between GitHub and Jira, engineers must include the
        Jira issue key in their pull request titles — e.g.&nbsp;
        <code style={{
          padding: '1px 6px',
          borderRadius: 6,
          background: 'var(--leap-surface-wash)',
          border: '1px solid var(--leap-border-soft)',
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12,
          color: 'var(--leap-text)',
        }}>
          [LEAP-42] Fix login bug
        </code>.
      </Callout>

      {/* --- Status --- */}
      <div style={sectionHeaderStyle}>
        <span style={{
          width: 6, height: 6, borderRadius: 999,
          background: 'var(--leap-accent-amber)',
          boxShadow: '0 0 8px color-mix(in srgb, var(--leap-accent-amber) 50%, transparent)',
        }} />
        Status
      </div>
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
        <div
          key={error}
          className="leap-form-error"
          role="alert"
          style={{
            marginTop: 14, padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(248, 113, 113, 0.08)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            color: '#fca5a5',
            fontFamily: "'Geist Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.05em',
          }}
        >
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
