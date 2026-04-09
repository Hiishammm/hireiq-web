'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createCheckout } from '@/lib/api';
import { Zap, ArrowLeft, LogOut, CheckCircle, Crown, Brain, FileText, Target } from 'lucide-react';
import Link from 'next/link';

const PRODUCTS = {
  roastPack: process.env.NEXT_PUBLIC_ROAST_PACK_PRODUCT_ID || '',
  fixCV: process.env.NEXT_PUBLIC_FIX_CV_PRODUCT_ID || '',
  tailorStarter: process.env.NEXT_PUBLIC_TAILOR_STARTER_PRODUCT_ID || '',
  tailorPro: process.env.NEXT_PUBLIC_TAILOR_PRO_PRODUCT_ID || '',
};

export default function UpgradePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
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

  const handleCheckout = async (productId: string, id: string) => {
    setLoadingId(id);
    setError('');
    try {
      const url = await createCheckout(productId);
      window.location.href = url;
    } catch {
      setError('Could not start checkout. Please try again.');
      setLoadingId(null);
    }
  };

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ fontSize: 40 }}>🧠</div>
    </div>
  );

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
            <Crown size={18} color="#D97706" />
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Upgrade</span>
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 10 }}>
            Unlock Your Full Potential
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
            Every tool you need to land your next role — AI-powered, ATS-optimized, instantly delivered.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '14px 16px', background: '#FF4D1C11', border: '1px solid #FF4D1C44',
            borderRadius: 12, marginBottom: 24, textAlign: 'center',
            fontSize: 14, color: '#FF4D1C',
          }}>
            {error}
          </div>
        )}

        {/* One-time purchases */}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>One-Time Purchases</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
          {/* Roast Pack */}
          <div style={{
            padding: 28, borderRadius: 20, background: 'var(--bg-card)',
            border: '1px solid #FF4D1C33', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FF4D1C15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={20} color="#FF4D1C" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Roast Pack</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#FF4D1C', margin: 0 }}>$5 <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>one-time</span></p>
              </div>
            </div>
            {['10 additional CV analyses', 'Full AI roast + critique', 'ATS score + issues'].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <CheckCircle size={14} color="#FF4D1C" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{f}</span>
              </div>
            ))}
            <button
              onClick={() => handleCheckout(PRODUCTS.roastPack, 'roastPack')}
              disabled={loadingId === 'roastPack'}
              style={{
                marginTop: 'auto', paddingTop: 20, padding: '13px', borderRadius: 12,
                background: loadingId === 'roastPack' ? '#FF4D1C88' : 'linear-gradient(135deg, #FF4D1C, #FF7A52)',
                color: 'white', fontSize: 14, fontWeight: 700, border: 'none',
                cursor: loadingId === 'roastPack' ? 'not-allowed' : 'pointer',
                boxShadow: loadingId === 'roastPack' ? 'none' : '0 4px 16px #FF4D1C44',
              }}
            >
              {loadingId === 'roastPack' ? 'Redirecting...' : 'Get 10 More Roasts — $5'}
            </button>
          </div>

          {/* Fix CV */}
          <div style={{
            padding: 28, borderRadius: 20, background: 'var(--bg-card)',
            border: '1px solid #16A34A33', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#16A34A15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} color="#16A34A" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Fix My CV</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#16A34A', margin: 0 }}>$5 <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>one-time</span></p>
              </div>
            </div>
            {['Full AI CV rewrite', 'ATS-optimized format', 'Strong action verbs + numbers', 'Ready to submit in minutes'].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <CheckCircle size={14} color="#16A34A" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{f}</span>
              </div>
            ))}
            <button
              onClick={() => handleCheckout(PRODUCTS.fixCV, 'fixCV')}
              disabled={loadingId === 'fixCV'}
              style={{
                marginTop: 'auto', paddingTop: 20, padding: '13px', borderRadius: 12,
                background: loadingId === 'fixCV' ? '#16A34A88' : 'linear-gradient(135deg, #16A34A, #22C55E)',
                color: 'white', fontSize: 14, fontWeight: 700, border: 'none',
                cursor: loadingId === 'fixCV' ? 'not-allowed' : 'pointer',
                boxShadow: loadingId === 'fixCV' ? 'none' : '0 4px 16px #16A34A44',
              }}
            >
              {loadingId === 'fixCV' ? 'Redirecting...' : 'Unlock Fix My CV — $5'}
            </button>
          </div>
        </div>

        {/* Subscriptions */}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>Monthly Subscriptions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Tailor Starter */}
          <div style={{
            padding: 28, borderRadius: 20, background: 'var(--bg-card)',
            border: '1px solid #D9770633', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#D9770615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={20} color="#D97706" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Tailor Starter</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#D97706', margin: 0 }}>$5<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/month</span></p>
              </div>
            </div>
            {['10 tailored CVs per month', 'JD keyword matching', 'ATS score for each application', 'Match score vs job description'].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <CheckCircle size={14} color="#D97706" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{f}</span>
              </div>
            ))}
            <button
              onClick={() => handleCheckout(PRODUCTS.tailorStarter, 'tailorStarter')}
              disabled={loadingId === 'tailorStarter'}
              style={{
                marginTop: 'auto', paddingTop: 20, padding: '13px', borderRadius: 12,
                background: loadingId === 'tailorStarter' ? '#D9770688' : 'linear-gradient(135deg, #D97706, #F59E0B)',
                color: 'white', fontSize: 14, fontWeight: 700, border: 'none',
                cursor: loadingId === 'tailorStarter' ? 'not-allowed' : 'pointer',
                boxShadow: loadingId === 'tailorStarter' ? 'none' : '0 4px 16px #D9770644',
              }}
            >
              {loadingId === 'tailorStarter' ? 'Redirecting...' : 'Start Tailoring — $5/mo'}
            </button>
          </div>

          {/* Tailor Pro */}
          <div style={{
            padding: 28, borderRadius: 20,
            background: 'linear-gradient(135deg, #0D0500, #0D0D0D)',
            border: '1px solid #D9770666', display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 800,
              color: '#D97706', background: '#D9770622', border: '1px solid #D9770644',
              padding: '3px 10px', borderRadius: 100, letterSpacing: 1,
            }}>BEST VALUE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#D9770622', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={20} color="#D97706" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Tailor Pro</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#D97706', margin: 0 }}>$12<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/month</span></p>
              </div>
            </div>
            {['60 tailored CVs per month', 'Everything in Starter', 'Priority AI processing', 'Unlimited job applications'].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <CheckCircle size={14} color="#D97706" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{f}</span>
              </div>
            ))}
            <button
              onClick={() => handleCheckout(PRODUCTS.tailorPro, 'tailorPro')}
              disabled={loadingId === 'tailorPro'}
              style={{
                marginTop: 'auto', paddingTop: 20, padding: '13px', borderRadius: 12,
                background: loadingId === 'tailorPro' ? '#D9770688' : 'linear-gradient(135deg, #D97706, #F59E0B)',
                color: 'white', fontSize: 14, fontWeight: 700, border: 'none',
                cursor: loadingId === 'tailorPro' ? 'not-allowed' : 'pointer',
                boxShadow: loadingId === 'tailorPro' ? 'none' : '0 4px 24px #D9770666',
              }}
            >
              {loadingId === 'tailorPro' ? 'Redirecting...' : 'Go Pro — $12/mo'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 28 }}>
          Secure payment via Lemon Squeezy · Cancel subscriptions anytime · All prices in USD
        </p>
      </div>
    </main>
  );
}
