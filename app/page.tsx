'use client';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, Zap, Shield, Star, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

function GradientOrb({ top, left, color = '#FF4D1C' }: { top: string; left: string; color?: string }) {
  return (
    <div style={{
      position: 'absolute', top, left,
      width: 500, height: 500, borderRadius: '50%',
      background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
      pointerEvents: 'none', filter: 'blur(40px)',
    }} />
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <main style={{ background: 'var(--bg)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', height: 64, borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            style={{ fontSize: 22 }}
          >🧠</motion.span>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>HireIQ</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/auth" style={{
            padding: '8px 18px', borderRadius: 10, color: 'var(--text-secondary)',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
            transition: 'color 0.2s',
          }}>Sign In</Link>
          <Link href="/auth?mode=signup" style={{
            padding: '9px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg, var(--fire), var(--fire-2))',
            color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 4px 20px var(--fire-glow)',
          }}>Get Started →</Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position: 'relative', overflow: 'hidden', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <GradientOrb top="-100px" left="-100px" />
        <GradientOrb top="200px" left="60%" color="#6366F1" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY, maxWidth: 860, margin: '0 auto', padding: '80px 24px', textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}
        >
          <motion.div variants={stagger} initial="hidden" animate="show">

            <motion.div variants={fadeUp}>
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px 6px 8px', borderRadius: 100,
                  border: '1px solid #FF4D1C33', background: 'var(--fire-dim)',
                  marginBottom: 32,
                }}
              >
                <span style={{ background: 'var(--fire)', borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: 'white' }}>NEW</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI-powered CV analysis & rewriting</span>
                <ChevronRight size={14} color="var(--text-muted)" />
              </motion.div>
            </motion.div>

            <motion.h1 variants={fadeUp} style={{
              fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 900,
              lineHeight: 1.0, letterSpacing: -3, marginBottom: 28,
            }}>
              Your CV is costing<br />
              <span style={{
                background: 'linear-gradient(135deg, #FF4D1C 0%, #FF7A52 50%, #FFB347 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite',
              }}>
                you the job.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} style={{
              fontSize: 20, color: 'var(--text-secondary)', lineHeight: 1.7,
              maxWidth: 560, margin: '0 auto 48px', fontWeight: 400,
            }}>
              Upload your CV and get brutally honest AI feedback, ATS readiness score, full rewrite, and job-tailored versions — in under 30 seconds.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth?mode=signup">
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: '0 12px 50px #FF4D1C55' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    padding: '15px 32px', borderRadius: 14,
                    background: 'linear-gradient(135deg, #FF4D1C, #FF7A52)',
                    color: 'white', fontSize: 16, fontWeight: 700,
                    boxShadow: '0 8px 30px var(--fire-glow)', cursor: 'pointer',
                  }}
                >
                  Analyze My CV Free <ArrowRight size={18} />
                </motion.div>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                <Shield size={14} color="var(--success)" />
                No credit card · Free forever
              </div>
            </motion.div>

          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            style={{
              display: 'flex', justifyContent: 'center', gap: 0,
              marginTop: 72, borderRadius: 20, overflow: 'hidden',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              flexWrap: 'wrap',
            }}
          >
            {[
              { num: '10K+', label: 'CVs Analyzed', icon: '📄' },
              { num: '94%', label: 'ATS Pass Rate', icon: '🎯' },
              { num: '4.9★', label: 'User Rating', icon: '⭐' },
              { num: '<30s', label: 'Analysis Time', icon: '⚡' },
            ].map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ background: 'var(--bg-elevated)' }}
                style={{
                  flex: '1 1 140px', padding: '24px 20px', textAlign: 'center',
                  borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--fire)', letterSpacing: -1 }}>{s.num}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, letterSpacing: 3, color: 'var(--fire)', marginBottom: 12, textTransform: 'uppercase' }}>How it works</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: -1.5, marginBottom: 64 }}>
            From upload to hired<br />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.7em' }}>in three simple steps</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
          {[
            { icon: '📤', num: '01', title: 'Upload', desc: 'Drop your PDF, Word, or TXT file. We extract the text instantly.' },
            { icon: '🧠', num: '02', title: 'AI Analysis', desc: 'Claude AI reviews your CV like a senior recruiter would. Brutal but fair.' },
            { icon: '🚀', num: '03', title: 'Fix & Apply', desc: 'Get your rewritten CV, tailor it to jobs, and start applying with confidence.' },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }} viewport={{ once: true }}
              whileHover={{ background: 'var(--bg-elevated)' }}
              style={{
                padding: '40px 36px', background: 'var(--bg-card)',
                borderRadius: i === 0 ? '20px 0 0 20px' : i === 2 ? '0 20px 20px 0' : 0,
                border: '1px solid var(--border)', borderRight: i < 2 ? 'none' : '1px solid var(--border)',
                transition: 'background 0.3s',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 20 }}>{item.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fire)', letterSpacing: 3, marginBottom: 10 }}>STEP {item.num}</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, letterSpacing: -0.5 }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 100px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, letterSpacing: 3, color: 'var(--fire)', marginBottom: 12, textTransform: 'uppercase' }}>Features</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: -1.5, marginBottom: 64 }}>Everything you need</h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { icon: '🔥', title: 'CV Roast', desc: 'Brutally honest AI feedback that actually makes you better', badge: 'FREE', color: '#FF4D1C', big: true },
            { icon: '📊', title: 'ATS Score', desc: 'Know your score before sending to any ATS system', badge: 'FREE', color: '#FF4D1C', big: false },
            { icon: '✍️', title: 'Fix My CV', desc: 'Full AI rewrite. ATS-optimized. Download PDF or Word.', badge: '$5', color: '#22C55E', big: false },
            { icon: '🎯', title: 'Tailor to Job', desc: 'Paste any JD and get a perfectly matched CV', badge: '$5/mo', color: '#F59E0B', big: false },
            { icon: '💼', title: 'LinkedIn Bio', desc: 'Turn your CV into a magnetic LinkedIn About section', badge: 'Soon', color: '#6366F1', big: false },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              whileHover={{ y: -4, borderColor: f.color + '44', boxShadow: `0 12px 40px ${f.color}15` }}
              style={{
                padding: 28, borderRadius: 18,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                gridColumn: f.big ? 'span 2' : 'span 1',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>{f.title}</h3>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100,
                  background: f.color + '18', color: f.color, border: `1px solid ${f.color}33`,
                  letterSpacing: 0.5,
                }}>{f.badge}</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 100px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, letterSpacing: 3, color: 'var(--fire)', marginBottom: 12, textTransform: 'uppercase' }}>Pricing</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: -1.5, marginBottom: 12 }}>Pay only when you need it</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 16, marginBottom: 64 }}>The CV roast is always free. Pay only for what you use.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { name: 'Free', price: '$0', sub: 'forever', color: 'var(--text-muted)', features: ['10 roasts per day', 'ATS readiness score', 'Full AI critique', 'Strengths & weaknesses'], cta: 'Start Free', ctaStyle: 'outline', pop: false },
            { name: 'Fix My CV', price: '$5', sub: 'one-time', color: '#22C55E', features: ['Full AI CV rewrite', 'ATS-optimized content', 'PDF + Word download', 'Named after you'], cta: 'Fix My CV', ctaStyle: 'green', pop: false },
            { name: 'Tailor Pro', price: '$20', sub: 'per month', color: '#FF4D1C', features: ['60 tailored CVs/mo', 'Job description matching', 'Keyword optimization', 'Match score per job'], cta: 'Go Pro', ctaStyle: 'fire', pop: true },
          ].map((plan, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              whileHover={{ y: -6 }}
              style={{
                padding: 28, borderRadius: 20, position: 'relative',
                border: `1px solid ${plan.pop ? '#FF4D1C44' : 'var(--border)'}`,
                background: plan.pop ? 'linear-gradient(160deg, #180800, var(--bg-card))' : 'var(--bg-card)',
                transition: 'transform 0.3s ease',
              }}
            >
              {plan.pop && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #FF4D1C, #FF7A52)',
                  color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 14px',
                  borderRadius: 100, letterSpacing: 1, whiteSpace: 'nowrap',
                }}>MOST POPULAR</div>
              )}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: 1 }}>{plan.name.toUpperCase()}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: -2, color: plan.color !== 'var(--text-muted)' ? plan.color : 'var(--text-primary)' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ {plan.sub}</span>
                </div>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <Check size={14} color={plan.color !== 'var(--text-muted)' ? plan.color : '#22C55E'} style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth?mode=signup">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                  display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12,
                  background: plan.ctaStyle === 'fire' ? 'linear-gradient(135deg, #FF4D1C, #FF7A52)' :
                    plan.ctaStyle === 'green' ? '#22C55E18' : 'var(--bg-elevated)',
                  color: plan.ctaStyle === 'fire' ? 'white' : plan.ctaStyle === 'green' ? '#22C55E' : 'var(--text-secondary)',
                  border: `1px solid ${plan.ctaStyle === 'fire' ? 'transparent' : plan.ctaStyle === 'green' ? '#22C55E44' : 'var(--border)'}`,
                  fontSize: 14, fontWeight: 700, textDecoration: 'none', cursor: 'pointer',
                  boxShadow: plan.ctaStyle === 'fire' ? '0 4px 20px #FF4D1C33' : 'none',
                }}>{plan.cta}</motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 100px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, letterSpacing: 3, color: 'var(--fire)', marginBottom: 12, textTransform: 'uppercase' }}>What people say</p>
          <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 60 }}>They got hired 🎉</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { name: 'James R.', role: 'Software Engineer → Google', text: 'My ATS score went from 42 to 87 after the fix. Got 3 interviews in a week.', stars: 5 },
            { name: 'Sarah L.', role: 'Marketing Manager → Meta', text: 'The roast was brutal but accurate 😅 Fixed my CV and landed my dream job in 2 weeks.', stars: 5 },
            { name: 'Marcus T.', role: 'Data Analyst → Amazon', text: 'Tailored my CV to 5 different jobs in one afternoon. The keyword matching is insane.', stars: 5 },
          ].map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              style={{ padding: 28, borderRadius: 18, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
            >
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {Array(t.stars).fill(0).map((_, j) => <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />)}
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '80px 24px 120px', position: 'relative', overflow: 'hidden' }}>
        <GradientOrb top="50%" left="50%" color="#FF4D1C" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          <div className="float" style={{ fontSize: 60, marginBottom: 24 }}>🧠</div>
          <h2 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, letterSpacing: -2, marginBottom: 16, lineHeight: 1.1 }}>
            Ready to get hired?
          </h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.7 }}>
            Join thousands of job seekers who turned their CVs from rejected to recruited.
          </p>
          <Link href="/auth?mode=signup">
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: '0 16px 60px #FF4D1C66' }}
              whileTap={{ scale: 0.97 }}
              className="pulse-glow"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                padding: '18px 44px', borderRadius: 16,
                background: 'linear-gradient(135deg, #FF4D1C, #FF7A52)',
                color: 'white', fontSize: 18, fontWeight: 800, textDecoration: 'none',
                cursor: 'pointer', letterSpacing: -0.3,
              }}
            >
              Analyze My CV — It&apos;s Free <Zap size={20} fill="white" />
            </motion.div>
          </Link>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>No credit card required · Free forever</p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🧠</span>
          <span style={{ fontWeight: 800, fontSize: 15 }}>HireIQ</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2026</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Sign In', '/auth']].map(([label, href]) => (
            <Link key={href} href={href} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
