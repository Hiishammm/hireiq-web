'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { extractText, fixCV, createCheckout } from '@/lib/api';
import { FileText, Upload, ArrowLeft, LogOut, CheckCircle, AlertCircle, Copy, Check, Lock } from 'lucide-react';
import Link from 'next/link';

const FIX_CV_PRODUCT_ID = process.env.NEXT_PUBLIC_FIX_CV_PRODUCT_ID || '';

interface FixResult {
  result: string;
  atsScore: number;
  atsImprovements: string[];
  atsIssues: string[];
}

export default function FixPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState('');
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);
  const [error, setError] = useState('');
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/auth'); return; }
      setUserEmail(session.user.email || '');

      // Check payment status on load — show wall immediately if not paid
      const { data: profile } = await supabase
        .from('profiles')
        .select('fix_cv_used')
        .eq('id', session.user.id)
        .single();

      // fix_cv_used === false means paid + not yet used → allow upload
      // anything else (null or true) → payment required
      if (!profile || profile.fix_cv_used !== false) {
        setPaymentRequired(true);
      }

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
    setPaymentRequired(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleFix = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    setPaymentRequired(false);
    try {
      const cvText = await extractText(file);
      const data = await fixCV(cvText);
      setResult(data as FixResult);
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string; status?: number };
      if (e.code === 'payment_required' || e.status === 403) {
        setPaymentRequired(true);
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
      const url = await createCheckout(FIX_CV_PRODUCT_ID);
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
            <FileText size={18} color="#16A34A" />
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Fix My CV</span>
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
            Fix My CV
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
            AI rewrites your entire CV — ATS optimized, strong action verbs, quantified achievements. One-time $5.
          </p>
        </div>

        {/* Upload Area */}
        {!result && !paymentRequired && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#16A34A' : file ? '#16A34A88' : 'var(--border)'}`,
              borderRadius: 20, padding: '48px 32px', textAlign: 'center',
              cursor: 'pointer', marginBottom: 16, transition: 'all 0.2s',
              background: dragging ? '#16A34A08' : 'var(--bg-card)',
            }}
          >
            <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <Upload size={32} color={file ? '#16A34A' : 'var(--text-muted)'} style={{ marginBottom: 12 }} />
            {file ? (
              <>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>{file.name}</p>
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
            <p style={{ fontSize: 14, color: '#FF4D1C', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Payment Required Wall */}
        {paymentRequired && (
          <div style={{
            padding: 40, borderRadius: 24,
            background: 'linear-gradient(135deg, #001A05, #0D0D0D)',
            border: '1px solid #16A34A44', textAlign: 'center',
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#16A34A22', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={28} color="#16A34A" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
              One-time $5 to unlock
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              Pay once and get your full AI-rewritten, ATS-optimized CV instantly. No subscription required.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
              {['ATS-optimized format', 'Strong action verbs', 'Quantified achievements', 'Keyword rich summary'].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <CheckCircle size={14} color="#16A34A" />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              style={{
                padding: '16px 48px', borderRadius: 14,
                background: checkoutLoading ? '#16A34A88' : 'linear-gradient(135deg, #16A34A, #22C55E)',
                color: 'white', fontSize: 16, fontWeight: 800, border: 'none',
                cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                boxShadow: checkoutLoading ? 'none' : '0 4px 20px #16A34A44',
              }}
            >
              {checkoutLoading ? 'Redirecting...' : 'Unlock Fix My CV — $5'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              Secure payment via Lemon Squeezy · Your CV is processed after payment
            </p>
          </div>
        )}

        {!result && !paymentRequired && file && (
          <button
            onClick={handleFix}
            disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: 14,
              background: loading ? '#16A34A88' : 'linear-gradient(135deg, #16A34A, #22C55E)',
              color: 'white', fontSize: 16, fontWeight: 800, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px #16A34A44',
              marginBottom: 32, transition: 'all 0.2s',
            }}
          >
            {loading ? 'Rewriting your CV...' : 'Fix My CV — $5 one-time'}
          </button>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* ATS Score */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24,
            }}>
              <div style={{ background: 'var(--bg-card)', border: `1px solid ${atsColor}44`, borderRadius: 16, padding: '20px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>New ATS Score</p>
                <div style={{ fontSize: 48, fontWeight: 900, color: atsColor, lineHeight: 1, marginBottom: 4 }}>{result.atsScore}</div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>out of 100</p>
                <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: '#ffffff11', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${result.atsScore}%`, background: atsColor, borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #16A34A33', borderRadius: 16, padding: '20px 24px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Improvements Made</p>
                {result.atsImprovements.slice(0, 3).map((imp, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                    <CheckCircle size={13} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{imp}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewritten CV */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Your Rewritten CV</p>
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8,
                    background: copied ? '#16A34A22' : 'var(--bg-card)',
                    border: `1px solid ${copied ? '#16A34A44' : 'var(--border)'}`,
                    color: copied ? '#16A34A' : 'var(--text-muted)',
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
                onClick={() => { setResult(null); setFile(null); setPaymentRequired(false); }}
                style={{
                  padding: '12px 24px', borderRadius: 12, background: 'var(--bg-card)',
                  border: '1px solid var(--border)', color: 'var(--text-primary)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Fix Another CV
              </button>
              <Link href="/dashboard/tailor" style={{
                padding: '12px 24px', borderRadius: 12,
                background: 'linear-gradient(135deg, #D97706, #F59E0B)',
                color: 'white', fontSize: 14, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 4px 16px #D9770644',
              }}>
                Tailor CV to a Job →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
