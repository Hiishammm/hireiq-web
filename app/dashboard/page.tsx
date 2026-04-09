'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Brain, FileText, Target, Zap, LogOut, Upload, ChevronRight, Crown } from 'lucide-react';
import Link from 'next/link';

interface Profile {
  email: string;
  roast_count_today: number;
  roast_last_date: string;
  fix_cv_used: boolean;
  subscription_plan: string;
  subscription_status: string;
  tailor_count_this_month: number;
  subscription_expires_at: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/auth'); return; }
      setUser(session.user);
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
      setLoading(false);
    });

    // Listen for session changes — redirect on sign out or expiry
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') router.replace('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ fontSize: 40 }}>🧠</div>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];
  const roastsToday = profile?.roast_last_date === today ? (profile?.roast_count_today ?? 0) : 0;
  const roastsLeft = Math.max(0, 10 - roastsToday);
  const isPro = profile?.subscription_status === 'active';
  const tailorLimit = profile?.subscription_plan === 'tailor_pro' ? 60 : 10;
  const tailorUsed = profile?.tailor_count_this_month ?? 0;

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: '#0A0A0Aee', backdropFilter: 'blur(12px)', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🧠</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>HireIQ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</span>
          {isPro && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
              color: '#D97706', background: '#D9770615', border: '1px solid #D9770633',
              padding: '4px 10px', borderRadius: 100,
            }}>
              <Crown size={12} /> PRO
            </span>
          )}
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
        {/* Welcome */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
            Welcome back 👋
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>
            {isPro ? 'You\'re on a Pro plan. Unlimited power.' : 'Free plan — upgrade for more features.'}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Roasts Today', value: `${roastsToday}/10`, sub: `${roastsLeft} remaining`, color: '#FF4D1C' },
            { label: 'Plan', value: isPro ? (profile?.subscription_plan === 'tailor_pro' ? 'Pro' : 'Starter') : 'Free', sub: isPro ? 'Active' : 'Upgrade available', color: isPro ? '#D97706' : 'var(--text-muted)' },
            ...(isPro ? [{ label: 'Tailors This Month', value: `${tailorUsed}/${tailorLimit}`, sub: `${tailorLimit - tailorUsed} remaining`, color: '#16A34A' }] : []),
          ].map((stat, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>{stat.label}</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tools */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Tools</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {[
            { icon: <Brain size={22} color="#FF4D1C" />, bg: '#FF4D1C15', title: 'Analyze My CV', desc: 'Get AI roast + ATS score + professional critique', badge: 'FREE', badgeColor: '#FF4D1C', href: '/dashboard/analyze' },
            { icon: <FileText size={22} color="#16A34A" />, bg: '#16A34A15', title: 'Fix My CV', desc: 'Full AI rewrite optimized for ATS systems', badge: '$5 one-time', badgeColor: '#16A34A', href: '/dashboard/fix' },
            { icon: <Target size={22} color="#D97706" />, bg: '#D9770615', title: 'Tailor CV to Job', desc: 'Match your CV to any job description', badge: isPro ? 'Pro' : '$5/mo', badgeColor: '#D97706', href: '/dashboard/tailor' },
            { icon: <Zap size={22} color="#6366F1" />, bg: '#6366F115', title: 'LinkedIn Makeover', desc: 'Turn your CV into a magnetic LinkedIn bio', badge: 'Coming Soon', badgeColor: '#6366F1', href: '#' },
          ].map((tool, i) => (
            <Link key={i} href={tool.href} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: 20,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, textDecoration: 'none', transition: 'border-color 0.2s',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: tool.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {tool.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{tool.title}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                    background: tool.badgeColor + '22', color: tool.badgeColor, border: `1px solid ${tool.badgeColor}44`,
                  }}>{tool.badge}</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tool.desc}</span>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </Link>
          ))}
        </div>

        {/* Upgrade banner */}
        {!isPro && (
          <div style={{
            padding: 28, borderRadius: 20, background: 'linear-gradient(135deg, #1A0800, #0D0D0D)',
            border: '1px solid #FF4D1C33', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Unlock Tailor CV to Job</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>10 tailored CVs/month · Match score · ATS keywords</p>
            </div>
            <Link href="/dashboard/upgrade" style={{
              padding: '12px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #FF4D1C, #FF7A52)',
              color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 20px #FF4D1C44', whiteSpace: 'nowrap',
            }}>
              Upgrade — $5/mo
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
