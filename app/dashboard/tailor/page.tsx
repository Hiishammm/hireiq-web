'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { extractText, tailorCV, createCheckout } from '@/lib/api';
import { Target, Upload, ArrowLeft, LogOut, CheckCircle, AlertCircle, Copy, Check, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

const TAILOR_STARTER_PRODUCT_ID = process.env.NEXT_PUBLIC_TAILOR_STARTER_PRODUCT_ID || '';

interface TailorResult {
  result: string;
  matchScore: number;
  keywordsAdded: string[];
  atsScore: number;
}

export default function TailorPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState('');
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [error, setError] = useState('');
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [copied, setCopied] = useState(false);
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
    setSubscriptionRequired(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleTailor = async () => {
    if (!file) { setError('Please upload your CV.'); return; }
    if (jobDescription.trim().length < 50) { setError('Please paste a job description (at least 50 characters).'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    setSubscriptionRequired(false);
    try {
      const cvText = await extractText(file);
      const data = await tailorCV(cvText, jobDescription.trim());
      setResult(data as TailorResult);
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string; status?: number };
      if (e.code === 'subscription_required' || e.status === 403) {
        setSubscriptionRequired(true);
      } else {
        setError(e.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const url = await createCheckout(TAILOR_STARTER_PRODUCT_ID);
      window.location.href = url;
    } catch {
      setError('Could not start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.result) return;
    await navigator.clipboard.writeText(result.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ fontSize: 40 }}>🧠</div>
    </div>
  );

  const matchColor = result ? (result.matchScore >= 75 ? '#16A34A' : result.matchScore >= 55 ? '#D97706' : '#FF4D1C') : '#D97706';
  const atsColor = result ? (result.atsScore >= 70 ? '#16A34A' : result.atsScore >= 50 ? '#D97706' : '#FF4D1C') : '#16A34A';

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
            <Target size={18} color="#D97706" />
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Tailor CV to Job</span>
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
            Tailor CV to Job
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
            Paste a job description and AI rewrites your CV to match — mirroring keywords, prioritizing relevant experience, boosting your match score.
          </p>
        </div>

        {/* Subscription Required Wall */}
        {subscriptionRequired && (
          <div style={{
            padding: 40, borderRadius: 24,
            background: 'linear-gradient(135deg, #1A0D00, #0D0D0D)',
            border: '1px solid #D9770644', textAlign: 'center',
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#D9770622', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={28} color="#D97706" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
              Subscription required
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              Tailor CV requires an active subscription. Get 10 tailored CVs per month for just $5/month.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
              {['10 tailored CVs/month', 'JD keyword matching', 'ATS score boost', 'Match score'].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <CheckCircle size={14} color="#D97706" />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              style={{
                padding: '16px 48px', borderRadius: 14,
                background: checkoutLoading ? '#D9770688' : 'linear-gradient(135deg, #D97706, #F59E0B)',
                color: 'white', fontSize: 16, fontWeight: 800, border: 'none',
                cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                boxShadow: checkoutLoading ? 'none' : '0 4px 20px #D9770644',
              }}
            >
              {checkoutLoading ? 'Redirecting...' : 'Subscribe — $5/month'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              Secure payment via Lemon Squeezy · Cancel anytime
            </p>
          </div>
        )}

        {!subscriptionRequired && !result && (
          <>
            {/* Upload Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#D97706' : file ? '#D9770688' : 'var(--border)'}`,
                borderRadius: 20, padding: '36px 32px', textAlign: 'center',
                cursor: 'pointer', marginBottom: 16, transition: 'all 0.2s',
                background: dragging ? '#D9770608' : 'var(--bg-card)',
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <Upload size={28} color={file ? '#D97706' : 'var(--text-muted)'} style={{ marginBottom: 10 }} />
              {file ? (
                <>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#D97706', marginBottom: 4 }}>{file.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to change file</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Drop your CV here
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>PDF or DOCX · Max 10 MB</p>
                </>
              )}
            </div>

            {/* Job Description */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here — the more detail, the better the match..."
                style={{
                  width: '100%', minHeight: 200, padding: 16,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 14, color: 'var(--text-primary)', fontSize: 14,
                  lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#D97706'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                {jobDescription.length} characters · min 50 required
              </p>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px',
                background: '#FF4D1C11', border: '1px solid #FF4D1C44', borderRadius: 12, marginBottom: 16,
              }}>
                <AlertCircle size={16} color="#FF4D1C" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 14, color: '#FF4D1C', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleTailor}
              disabled={loading || !file || jobDescription.trim().length < 50}
              style={{
                width: '100%', padding: '16px', borderRadius: 14,
                background: (loading || !file || jobDescription.trim().length < 50)
                  ? '#D9770688' : 'linear-gradient(135deg, #D97706, #F59E0B)',
                color: 'white', fontSize: 16, fontWeight: 800, border: 'none',
                cursor: (loading || !file || jobDescription.trim().length < 50) ? 'not-allowed' : 'pointer',
                boxShadow: (loading || !file || jobDescription.trim().length < 50) ? 'none' : '0 4px 20px #D9770644',
                marginBottom: 32, transition: 'all 0.2s',
              }}
            >
              {loading ? 'Tailoring your CV...' : 'Tailor My CV'}
            </button>
          </>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'var(--bg-card)', border: `1px solid ${matchColor}44`, borderRadius: 16, padding: '20px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Job Match Score</p>
                <div style={{ fontSize: 48, fontWeight: 900, color: matchColor, lineHeight: 1, marginBottom: 4 }}>{result.matchScore}%</div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>match with this role</p>
                <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: '#ffffff11', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${result.matchScore}%`, background: matchColor, borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: `1px solid ${atsColor}44`, borderRadius: 16, padding: '20px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>ATS Score</p>
                <div style={{ fontSize: 48, fontWeight: 900, color: atsColor, lineHeight: 1, marginBottom: 4 }}>{result.atsScore}</div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>out of 100</p>
                <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: '#ffffff11', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${result.atsScore}%`, background: atsColor, borderRadius: 3 }} />
                </div>
              </div>
            </div>

            {/* Keywords Added */}
            {result.keywordsAdded.length > 0 && (
              <div style={{ padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Zap size={14} color="#D97706" />
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Keywords Added</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.keywordsAdded.map((kw, i) => (
                    <span key={i} style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100,
                      background: '#D9770622', color: '#D97706', border: '1px solid #D9770633',
                    }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tailored CV */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Your Tailored CV</p>
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8,
                    background: copied ? '#D9770622' : 'var(--bg-card)',
                    border: `1px solid ${copied ? '#D9770644' : 'var(--border)'}`,
                    color: copied ? '#D97706' : 'var(--text-muted)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
              <textarea
                readOnly
                value={result.result}
                style={{
                  width: '100%', minHeight: 480, padding: 20,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 16, color: 'var(--text-primary)', fontSize: 13,
                  lineHeight: 1.7, resize: 'vertical', fontFamily: 'monospace',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => { setResult(null); setFile(null); setJobDescription(''); }}
                style={{
                  padding: '12px 24px', borderRadius: 12, background: 'var(--bg-card)',
                  border: '1px solid var(--border)', color: 'var(--text-primary)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Tailor Another CV
              </button>
              <Link href="/dashboard/analyze" style={{
                padding: '12px 24px', borderRadius: 12,
                background: 'linear-gradient(135deg, #FF4D1C, #FF7A52)',
                color: 'white', fontSize: 14, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 4px 16px #FF4D1C44',
              }}>
                Analyze Another CV →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
