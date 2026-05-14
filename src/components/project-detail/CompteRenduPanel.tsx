import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CardShell } from '../dashboard/CardShell';
import { getCompteRendus, createCompteRendu, createCompteRenduFromFile } from '../../lib/api';
import type { CompteRendu } from '../../lib/types';

interface Props {
  projectId: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Geist Mono', monospace",
      fontSize: 10, letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--leap-text-faint)',
      marginBottom: 7,
    }}>
      {children}
    </div>
  );
}

function ExpiryBadge({ cr }: { cr: CompteRendu }) {
  if (!cr.is_active) {
    return (
      <span style={{
        fontSize: 10, padding: '2px 7px',
        borderRadius: 20,
        background: 'var(--leap-band-warn-faint)',
        color: 'var(--leap-band-warn)',
        fontFamily: "'Geist Mono', monospace",
        letterSpacing: '0.06em',
      }}>
        expired
      </span>
    );
  }
  return (
    <span style={{
      fontSize: 10, padding: '2px 7px',
      borderRadius: 20,
      background: 'var(--leap-band-exceptional-faint)',
      color: 'var(--leap-band-exceptional)',
      fontFamily: "'Geist Mono', monospace",
      letterSpacing: '0.06em',
    }}>
      active · {cr.days_remaining}d
    </span>
  );
}

function CompteRenduCard({ cr, expanded, onToggle }: {
  cr: CompteRendu;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{
      border: '1px solid var(--leap-border-soft)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 8,
      opacity: cr.is_active ? 1 : 0.52,
    }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', cursor: 'pointer',
          background: 'var(--leap-surface-soft)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 12.5, color: 'var(--leap-text-dim)',
            letterSpacing: '-0.01em',
          }}>
            {new Date(cr.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </span>
          <span style={{
            fontSize: 10, color: 'var(--leap-text-faint)',
            fontFamily: "'Geist Mono', monospace",
          }}>
            {new Date(cr.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
          <ExpiryBadge cr={cr} />
        </div>
        <span style={{
          color: 'var(--leap-text-faint)',
          fontSize: 11,
          fontFamily: "'Geist Mono', monospace",
          display: 'inline-block',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.18s ease',
        }}>
          ▾
        </span>
      </div>

      {expanded && (
        <div style={{ padding: '14px 16px' }}>

          {cr.resume && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel>resume</SectionLabel>
              <p style={{
                fontSize: 13, color: 'var(--leap-text-dim)',
                lineHeight: 1.65, margin: 0,
                padding: '10px 12px',
                background: 'var(--leap-surface-soft)',
                borderRadius: 8,
                borderLeft: '2px solid var(--leap-border)',
              }}>
                {cr.resume}
              </p>
            </div>
          )}

          {cr.decisions.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel>decisions · {cr.decisions.length}</SectionLabel>
              {cr.decisions.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '8px 12px', marginBottom: 4,
                  background: 'var(--leap-band-exceptional-faint)',
                  borderRadius: 8,
                  fontSize: 13, color: 'var(--leap-text)',
                }}>
                  <span style={{
                    color: 'var(--leap-band-exceptional)',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 10, marginTop: 3, flexShrink: 0,
                  }}>—</span>
                  {d}
                </div>
              ))}
            </div>
          )}

          {cr.actions.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel>actions · {cr.actions.length}</SectionLabel>
              {cr.actions.map((a, i) => (
                <div key={i} style={{
                  padding: '10px 12px', marginBottom: 4,
                  background: 'var(--leap-surface-soft)',
                  border: '1px solid var(--leap-border-soft)',
                  borderRadius: 8,
                  fontSize: 13,
                }}>
                  <div style={{ fontWeight: 500, color: 'var(--leap-text)', marginBottom: 5 }}>
                    {a.action}
                  </div>
                  <div style={{
                    display: 'flex', gap: 14,
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 10, letterSpacing: '0.06em',
                    color: 'var(--leap-text-faint)',
                  }}>
                    <span>{a.responsible}</span>
                    {a.deadline && (
                      <span style={{ color: 'var(--leap-accent-amber)' }}>{a.deadline}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {cr.blocages.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <SectionLabel>blockers · {cr.blocages.length}</SectionLabel>
              {cr.blocages.map((b, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '8px 12px', marginBottom: 4,
                  background: 'var(--leap-band-warn-faint)',
                  borderRadius: 8,
                  fontSize: 13, color: 'var(--leap-text)',
                }}>
                  <span style={{
                    color: 'var(--leap-band-warn)',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 10, marginTop: 3, flexShrink: 0,
                  }}>—</span>
                  {b}
                </div>
              ))}
            </div>
          )}

          <details style={{ marginTop: 12 }}>
            <summary style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10, letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--leap-text-faint)',
              cursor: 'pointer', userSelect: 'none',
              listStyle: 'none',
            }}>
              raw text
            </summary>
            <pre style={{
              fontSize: 11.5, color: 'var(--leap-text-faint)',
              whiteSpace: 'pre-wrap', marginTop: 8, marginBottom: 0,
              padding: '10px 12px',
              background: 'var(--leap-surface-wash)',
              borderRadius: 8,
              lineHeight: 1.6,
              fontFamily: "'Geist Mono', monospace",
            }}>
              {cr.raw_text}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default function CompteRenduPanel({ projectId }: Props) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [tab, setTab] = useState<'text' | 'file'>('text');
  const [dragOver, setDragOver] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: allCRs = [], isLoading } = useQuery({
    queryKey: ['compte-rendus', projectId],
    queryFn: () => getCompteRendus(projectId),
  });

  const mutation = useMutation({
    mutationFn: (rawText: string) => createCompteRendu(projectId, rawText),
    onSuccess: (newCR) => {
      queryClient.invalidateQueries({ queryKey: ['compte-rendus', projectId] });
      setText('');
      setExpandedId(newCR.id);
    },
  });

  const fileMutation = useMutation({
    mutationFn: (file: File) => createCompteRenduFromFile(projectId, file),
    onSuccess: (newCR) => {
      queryClient.invalidateQueries({ queryKey: ['compte-rendus', projectId] });
      setExpandedId(newCR.id);
    },
  });

  const activeCRs = allCRs.filter(cr => cr.is_active);
  const expiredCRs = allCRs.filter(cr => !cr.is_active);
  const displayedExpired = showAll ? expiredCRs : expiredCRs.slice(0, 3);
  const canSubmit = text.trim().length >= 30 && !mutation.isPending;

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px',
    borderRadius: 8,
    border: '1px solid var(--leap-border)',
    background: active ? 'var(--leap-surface-wash)' : 'transparent',
    color: active ? 'var(--leap-text)' : 'var(--leap-text-faint)',
    fontSize: 10,
    fontFamily: "'Geist Mono', monospace",
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <CardShell interactive={false} style={{ padding: 22, marginTop: 18 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--leap-text-faint)',
        marginBottom: 18,
      }}>
        meeting reports
        <span style={{ marginLeft: 'auto', color: 'var(--leap-text-dim)' }}>
          ai analysis · expires after 7 days
        </span>
      </div>

      {/* Input form */}
      <div style={{
        background: 'var(--leap-surface-soft)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 22,
        border: '1px solid var(--leap-border-soft)',
      }}>
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--leap-text-faint)',
          marginBottom: 12,
        }}>
          new meeting report
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <button style={tabBtnStyle(tab === 'text')} onClick={() => setTab('text')}>
            text
          </button>
          <button style={tabBtnStyle(tab === 'file')} onClick={() => setTab('file')}>
            file
          </button>
        </div>

        {tab === 'text' ? (
          <>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste the meeting report text here…"
              rows={5}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px',
                fontSize: 13, lineHeight: 1.6,
                borderRadius: 8,
                border: '1px solid var(--leap-border)',
                background: 'var(--leap-input-bg)',
                color: 'var(--leap-text)',
                resize: 'vertical',
                fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
                outline: 'none',
              }}
            />
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginTop: 10,
            }}>
              <span style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10, letterSpacing: '0.08em',
                color: 'var(--leap-text-faint)',
              }}>
                {text.length} chars
                {text.length > 0 && text.length < 30 && ' · too short'}
              </span>
              <button
                onClick={() => mutation.mutate(text)}
                disabled={!canSubmit}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--leap-border)',
                  background: canSubmit ? 'var(--leap-surface-wash)' : 'transparent',
                  color: canSubmit ? 'var(--leap-text)' : 'var(--leap-text-faint)',
                  fontSize: 10,
                  fontFamily: "'Geist Mono', monospace",
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
              >
                {mutation.isPending ? 'analyzing…' : 'analyze'}
              </button>
            </div>
            {mutation.isError && (
              <div style={{
                marginTop: 8, fontSize: 11,
                color: 'var(--leap-band-warn)',
                padding: '6px 10px',
                background: 'var(--leap-band-warn-faint)',
                borderRadius: 8,
                fontFamily: "'Geist Mono', monospace",
                letterSpacing: '0.04em',
              }}>
                {(mutation.error as Error)?.message ?? "analysis failed"}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) fileMutation.mutate(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `1px dashed ${dragOver ? 'var(--leap-text-dim)' : 'var(--leap-border)'}`,
                borderRadius: 8,
                padding: '28px 16px',
                textAlign: 'center',
                cursor: fileMutation.isPending ? 'default' : 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
                background: dragOver ? 'var(--leap-surface-wash)' : 'transparent',
              }}
            >
              <div style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10, letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: fileMutation.isPending ? 'var(--leap-text-dim)' : 'var(--leap-text-faint)',
                lineHeight: 2.2,
              }}>
                {fileMutation.isPending
                  ? 'extracting and analyzing…'
                  : (
                    <>
                      drop a file here or click to browse
                      <br />
                      <span style={{ opacity: 0.6, fontSize: 9 }}>
                        pdf · docx · txt · max 10 mb
                      </span>
                    </>
                  )
                }
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) fileMutation.mutate(file);
                  e.target.value = '';
                }}
              />
            </div>
            {fileMutation.isError && (
              <div style={{
                marginTop: 8, fontSize: 11,
                color: 'var(--leap-band-warn)',
                padding: '6px 10px',
                background: 'var(--leap-band-warn-faint)',
                borderRadius: 8,
                fontFamily: "'Geist Mono', monospace",
                letterSpacing: '0.04em',
              }}>
                {(fileMutation.error as Error)?.message ?? "erreur lors de l'analyse"}
              </div>
            )}
          </>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--leap-text-faint)',
          padding: '20px 0',
        }}>
          loading…
        </div>
      ) : (
        <>
          {activeCRs.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10, letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--leap-text-faint)',
                marginBottom: 8,
              }}>
                active · {activeCRs.length}
              </div>
              {activeCRs.map(cr => (
                <CompteRenduCard
                  key={cr.id}
                  cr={cr}
                  expanded={expandedId === cr.id}
                  onToggle={() => setExpandedId(expandedId === cr.id ? null : cr.id)}
                />
              ))}
            </div>
          )}

          {expiredCRs.length > 0 && (
            <div>
              <div style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10, letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--leap-text-faint)',
                marginBottom: 8,
              }}>
                history · {expiredCRs.length}
              </div>
              {displayedExpired.map(cr => (
                <CompteRenduCard
                  key={cr.id}
                  cr={cr}
                  expanded={expandedId === cr.id}
                  onToggle={() => setExpandedId(expandedId === cr.id ? null : cr.id)}
                />
              ))}
              {expiredCRs.length > 3 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  style={{
                    width: '100%', padding: '8px',
                    borderRadius: 8,
                    border: '1px solid var(--leap-border-soft)',
                    background: 'transparent',
                    color: 'var(--leap-text-faint)',
                    fontSize: 10,
                    fontFamily: "'Geist Mono', monospace",
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    marginTop: 4,
                  }}
                >
                  {showAll ? 'show less' : `+${expiredCRs.length - 3} more`}
                </button>
              )}
            </div>
          )}

          {allCRs.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '28px 16px',
              color: 'var(--leap-text-faint)',
              fontSize: 10,
              fontFamily: "'Geist Mono', monospace",
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              border: '1px dashed var(--leap-border-soft)',
              borderRadius: 12,
            }}>
              no meeting reports — paste text or drop a file above
            </div>
          )}
        </>
      )}
    </CardShell>
  );
}
