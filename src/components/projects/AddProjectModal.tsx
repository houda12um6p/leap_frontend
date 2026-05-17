import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Callout } from '../ui/Callout';
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

const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.55)';
};
const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'var(--leap-border)';
};

export function AddProjectModal() {
  const snap = useSnapshot(dashboardState);
  const create = useCreateProject();
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  const [jiraKey, setJiraKey] = useState('');
  const [jiraUrl, setJiraUrl] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraToken, setJiraToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setRepo('');
    setJiraKey('');
    setJiraUrl('');
    setJiraEmail('');
    setJiraToken('');
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError('Project name is required.');
    if (!repo.trim()) return setError('Repository URL is required.');
    try {
      await create.mutateAsync({
        name: name.trim(),
        repo_url: repo.trim(),
        jira_key:       jiraKey.trim()   ? jiraKey.trim()   : null,
        jira_base_url:  jiraUrl.trim()   ? jiraUrl.trim()   : null,
        jira_email:     jiraEmail.trim() ? jiraEmail.trim() : null,
        jira_api_token: jiraToken.trim() ? jiraToken.trim() : null,
      });
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
        Jira connection <span style={{ opacity: 0.5 }}>· optional</span>
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

      <label style={labelStyle}>Jira API token</label>
      <input
        value={jiraToken}
        onChange={(e) => setJiraToken(e.target.value)}
        placeholder="paste your Jira API token"
        type="password"
        autoComplete="new-password"
        spellCheck={false}
        style={inputStyle}
        onFocus={focusBorder}
        onBlur={blurBorder}
      />

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
