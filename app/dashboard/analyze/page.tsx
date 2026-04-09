'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { extractText, roastCV } from '@/lib/api';
import { Brain, Upload, ArrowLeft, LogOut, CheckCircle, AlertCircle, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface RoastResult {
  roast: string;
  critique: {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    topFix: string;
    atsScore: number;
    atsIssues: string[];
  };
}

function ScoreBadge({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${color}44`,
      borderRadius: 16, padding: '20px 24px', textAlign: 'center',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>{label}</p>
      <div style={{
        fontSize: 48, fontWeight: 900, color,
        lineHeight: 1, marginBottom: 4,
      }}>{score}</div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>out of 100</p>
      <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: '#ffffff11', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState('');
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/auth'); return; }
      setUserEmail(session.user.email || '');
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/auth');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const handleFile = (f: File) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|docx)$/i)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return; }
    setFile(f);
    setError('');
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const cvText = await extractText(file);
      const data = await roastCV(cvText);
      setResult(data);
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string; status?: number };
      if (e.code === 'free_limit_reached' || e.status === 429) {
        setError("You've used all 10 free roasts. Get 10 more for $5.");
      } else {
        setError(e.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ fontSize: 40 }}>🧠</div>
    </div>
  );

  const c = result?.critique;
  const scoreColor = c ? (c.score >= 70 ? '#16A34A' : c.score >= 50 ? '#D97706' : '#FF4D1C') : '#FF4D1C';
  const atsColor = c ? (c.atsScore >= 70 ? '#16A34A' : c.atsScore >= 50 ? '#D97706' : '#FF4D1C') : '#FF4D1C';

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: '#0A0A0Aee', backdropFilter: 'blur(12px)', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={18} color="#FF4D1C" />
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Analyze My CV</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{userEmail}</span>
          <button onClick={handleSignOut} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none',
            border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px',
            color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
          }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
            Analyze My CV
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
            Upload your CV and get a brutal AI roast + professional critique + ATS score. Up to 10 free analyses.
          </p>
        </div>

        {/* Upload Area */}
        {!result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#FF4D1C' : file ? '#FF4D1C88' : 'var(--border)'}`,
              borderRadius: 20, padding: '48px 32px', textAlign: 'center',
              cursor: 'pointer', marginBottom: 16, transition: 'all 0.2s',
              background: dragging ? '#FF4D1C08' : 'var(--bg-card)',
            }}
          >
            <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <Upload size={32} color={file ? '#FF4D1C' : 'var(--text-muted)'} style={{ marginBottom: 12 }} />
            {file ? (
              <>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#FF4D1C', marginBottom: 4 }}>{file.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to change file</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Drop your CV here
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>PDF or DOCX · Max 10 MB</p>
              </>
            )}
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px',
            background: '#FF4D1C11', border: '1px solid #FF4D1C44', borderRadius: 12, marginBottom: 16,
          }}>
            <AlertCircle size={16} color="#FF4D1C" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 14, color: '#FF4D1C', margin: 0 }}>{error}</p>
              {error.includes('10 free roasts') && (
                <Link href="/dashboard/upgrade" style={{ fontSize: 13, color: '#FF4D1C', fontWeight: 700, marginTop: 4, display: 'inline-block' }}>
                  Get 10 more roasts — $5 →
                </Link>
              )}
            </div>
          </div>
        )}

        {!result && file && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: 14,
              background: loading ? '#FF4D1C88' : 'linear-gradient(135deg, #FF4D1C, #FF7A52)',
              color: 'white', fontSize: 16, fontWeight: 800, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px #FF4D1C44',
              marginBottom: 32, transition: 'all 0.2s',
            }}
          >
            {loading ? 'Analyzing your CV...' : 'Analyze My CV'}
          </button>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Roast */}
            <div style={{
              padding: 28, borderRadius: 20,
              background: 'linear-gradient(135deg, #1A0800, #0D0D0D)',
              border: '1px solid #FF4D1C44', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>🔥</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#FF4D1C', textTransform: 'uppercase', letterSpacing: 1 }}>The Roast</span>
              </div>
              <p style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                "{result.roast}"
              </p>
            </div>

            {/* Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <ScoreBadge score={c!.score} label="Overall Score" color={scoreColor} />
              <ScoreBadge score={c!.atsScore} label="ATS Score" color={atsColor} />
            </div>

            {/* Summary */}
            <div style={{
              padding: 24, borderRadius: 16, background: 'var(--bg-card)',
              border: '1px solid var(--border)', marginBottom: 24,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Professional Assessment</p>
              <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>{c!.summary}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ padding: 24, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid #16A34A33' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Strengths</p>
                {c!.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                    <CheckCircle size={14} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{s}</p>
                  </div>
                ))}
              </div>
              <div style={{ padding: 24, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid #FF4D1C33' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#FF4D1C', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Weaknesses</p>
                {c!.weaknesses.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                    <AlertCircle size={14} color="#FF4D1C" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{w}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Fix */}
            <div style={{
              padding: 20, borderRadius: 16, background: '#D9770611',
              border: '1px solid #D9770633', marginBottom: 24,
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <Zap size={18} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#D97706', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Top Priority Fix</p>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>{c!.topFix}</p>
              </div>
            </div>

            {/* ATS Issues */}
            {c!.atsIssues.length > 0 && (
              <div style={{ padding: 24, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>ATS Issues to Fix</p>
                {c!.atsIssues.map((issue, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                    <ChevronRight size={14} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{issue}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => { setResult(null); setFile(null); }}
                style={{
                  padding: '12px 24px', borderRadius: 12, background: 'var(--bg-card)',
                  border: '1px solid var(--border)', color: 'var(--text-primary)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Analyze Another CV
              </button>
              <Link href="/dashboard/fix" style={{
                padding: '12px 24px', borderRadius: 12,
                background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                color: 'white', fontSize: 14, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 4px 16px #16A34A44',
              }}>
                Fix My CV — $5 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
