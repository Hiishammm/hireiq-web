'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Eye, EyeOff, ChevronDown, Search } from 'lucide-react';

// ── Country codes ───────────────────────────────────────────────────────────

interface Country {
  flag: string;
  name: string;
  code: string;       // dial code, e.g. "+1"
  dialKey: string;    // unique key (same as code unless two countries share it)
  min: number;        // min local digits
  max: number;        // max local digits
  placeholder: string;
}

const COUNTRY_CODES: Country[] = [
  { flag: '🇺🇸', name: 'United States', code: '+1',   dialKey: '+1-US', min: 10, max: 10, placeholder: '555 123 4567' },
  { flag: '🇬🇧', name: 'United Kingdom', code: '+44',  dialKey: '+44',   min: 10, max: 10, placeholder: '7911 123456' },
  { flag: '🇨🇦', name: 'Canada',         code: '+1',   dialKey: '+1-CA', min: 10, max: 10, placeholder: '604 123 4567' },
  { flag: '🇦🇺', name: 'Australia',      code: '+61',  dialKey: '+61',   min:  9, max:  9, placeholder: '412 345 678' },
  { flag: '🇩🇪', name: 'Germany',        code: '+49',  dialKey: '+49',   min: 10, max: 11, placeholder: '1512 3456789' },
  { flag: '🇫🇷', name: 'France',         code: '+33',  dialKey: '+33',   min:  9, max:  9, placeholder: '6 12 34 56 78' },
  { flag: '🇮🇹', name: 'Italy',          code: '+39',  dialKey: '+39',   min:  9, max: 10, placeholder: '312 345 6789' },
  { flag: '🇪🇸', name: 'Spain',          code: '+34',  dialKey: '+34',   min:  9, max:  9, placeholder: '612 345 678' },
  { flag: '🇳🇱', name: 'Netherlands',    code: '+31',  dialKey: '+31',   min:  9, max:  9, placeholder: '6 12345678' },
  { flag: '🇸🇪', name: 'Sweden',         code: '+46',  dialKey: '+46',   min:  7, max:  9, placeholder: '70 123 45 67' },
  { flag: '🇳🇴', name: 'Norway',         code: '+47',  dialKey: '+47',   min:  8, max:  8, placeholder: '41 23 45 67' },
  { flag: '🇩🇰', name: 'Denmark',        code: '+45',  dialKey: '+45',   min:  8, max:  8, placeholder: '20 12 34 56' },
  { flag: '🇨🇭', name: 'Switzerland',    code: '+41',  dialKey: '+41',   min:  9, max:  9, placeholder: '79 123 45 67' },
  { flag: '🇧🇪', name: 'Belgium',        code: '+32',  dialKey: '+32',   min:  9, max:  9, placeholder: '470 12 34 56' },
  { flag: '🇵🇱', name: 'Poland',         code: '+48',  dialKey: '+48',   min:  9, max:  9, placeholder: '512 345 678' },
  { flag: '🇵🇹', name: 'Portugal',       code: '+351', dialKey: '+351',  min:  9, max:  9, placeholder: '912 345 678' },
  { flag: '🇬🇷', name: 'Greece',         code: '+30',  dialKey: '+30',   min: 10, max: 10, placeholder: '691 234 5678' },
  { flag: '🇦🇹', name: 'Austria',        code: '+43',  dialKey: '+43',   min:  9, max: 10, placeholder: '650 1234567' },
  { flag: '🇨🇿', name: 'Czech Republic', code: '+420', dialKey: '+420',  min:  9, max:  9, placeholder: '601 234 567' },
  { flag: '🇷🇴', name: 'Romania',        code: '+40',  dialKey: '+40',   min:  9, max:  9, placeholder: '712 345 678' },
  { flag: '🇭🇺', name: 'Hungary',        code: '+36',  dialKey: '+36',   min:  9, max:  9, placeholder: '20 123 4567' },
  { flag: '🇺🇦', name: 'Ukraine',        code: '+380', dialKey: '+380',  min:  9, max:  9, placeholder: '67 123 4567' },
  { flag: '🇷🇺', name: 'Russia',         code: '+7',   dialKey: '+7',    min: 10, max: 10, placeholder: '912 345 6789' },
  { flag: '🇮🇳', name: 'India',          code: '+91',  dialKey: '+91',   min: 10, max: 10, placeholder: '98765 43210' },
  { flag: '🇨🇳', name: 'China',          code: '+86',  dialKey: '+86',   min: 11, max: 11, placeholder: '131 2345 6789' },
  { flag: '🇯🇵', name: 'Japan',          code: '+81',  dialKey: '+81',   min: 10, max: 11, placeholder: '90 1234 5678' },
  { flag: '🇰🇷', name: 'South Korea',    code: '+82',  dialKey: '+82',   min: 10, max: 11, placeholder: '10 1234 5678' },
  { flag: '🇸🇬', name: 'Singapore',      code: '+65',  dialKey: '+65',   min:  8, max:  8, placeholder: '8123 4567' },
  { flag: '🇲🇾', name: 'Malaysia',       code: '+60',  dialKey: '+60',   min:  9, max: 10, placeholder: '12 345 6789' },
  { flag: '🇮🇩', name: 'Indonesia',      code: '+62',  dialKey: '+62',   min:  9, max: 12, placeholder: '812 345 678' },
  { flag: '🇵🇭', name: 'Philippines',    code: '+63',  dialKey: '+63',   min: 10, max: 10, placeholder: '917 123 4567' },
  { flag: '🇻🇳', name: 'Vietnam',        code: '+84',  dialKey: '+84',   min:  9, max: 10, placeholder: '91 234 5678' },
  { flag: '🇹🇭', name: 'Thailand',       code: '+66',  dialKey: '+66',   min:  9, max:  9, placeholder: '81 234 5678' },
  { flag: '🇵🇰', name: 'Pakistan',       code: '+92',  dialKey: '+92',   min: 10, max: 10, placeholder: '301 234 5678' },
  { flag: '🇧🇩', name: 'Bangladesh',     code: '+880', dialKey: '+880',  min: 10, max: 10, placeholder: '1712 345678' },
  { flag: '🇳🇿', name: 'New Zealand',    code: '+64',  dialKey: '+64',   min:  8, max:  9, placeholder: '21 123 4567' },
  { flag: '🇿🇦', name: 'South Africa',   code: '+27',  dialKey: '+27',   min:  9, max:  9, placeholder: '71 234 5678' },
  { flag: '🇳🇬', name: 'Nigeria',        code: '+234', dialKey: '+234',  min: 10, max: 10, placeholder: '803 123 4567' },
  { flag: '🇰🇪', name: 'Kenya',          code: '+254', dialKey: '+254',  min:  9, max:  9, placeholder: '712 345 678' },
  { flag: '🇬🇭', name: 'Ghana',          code: '+233', dialKey: '+233',  min:  9, max:  9, placeholder: '24 123 4567' },
  { flag: '🇪🇹', name: 'Ethiopia',       code: '+251', dialKey: '+251',  min:  9, max:  9, placeholder: '91 123 4567' },
  { flag: '🇹🇿', name: 'Tanzania',       code: '+255', dialKey: '+255',  min:  9, max:  9, placeholder: '74 123 4567' },
  { flag: '🇪🇬', name: 'Egypt',          code: '+20',  dialKey: '+20',   min: 10, max: 10, placeholder: '100 123 4567' },
  { flag: '🇸🇦', name: 'Saudi Arabia',   code: '+966', dialKey: '+966',  min:  9, max:  9, placeholder: '50 123 4567' },
  { flag: '🇦🇪', name: 'UAE',            code: '+971', dialKey: '+971',  min:  9, max:  9, placeholder: '50 123 4567' },
  { flag: '🇶🇦', name: 'Qatar',          code: '+974', dialKey: '+974',  min:  8, max:  8, placeholder: '3312 3456' },
  { flag: '🇰🇼', name: 'Kuwait',         code: '+965', dialKey: '+965',  min:  8, max:  8, placeholder: '5012 3456' },
  { flag: '🇧🇭', name: 'Bahrain',        code: '+973', dialKey: '+973',  min:  8, max:  8, placeholder: '3312 3456' },
  { flag: '🇴🇲', name: 'Oman',           code: '+968', dialKey: '+968',  min:  8, max:  8, placeholder: '9123 4567' },
  { flag: '🇯🇴', name: 'Jordan',         code: '+962', dialKey: '+962',  min:  9, max:  9, placeholder: '79 123 4567' },
  { flag: '🇱🇧', name: 'Lebanon',        code: '+961', dialKey: '+961',  min:  7, max:  8, placeholder: '71 234 567' },
  { flag: '🇮🇱', name: 'Israel',         code: '+972', dialKey: '+972',  min:  9, max:  9, placeholder: '50 234 5678' },
  { flag: '🇹🇷', name: 'Turkey',         code: '+90',  dialKey: '+90',   min: 10, max: 10, placeholder: '532 123 4567' },
  { flag: '🇮🇷', name: 'Iran',           code: '+98',  dialKey: '+98',   min: 10, max: 10, placeholder: '912 345 6789' },
  { flag: '🇲🇦', name: 'Morocco',        code: '+212', dialKey: '+212',  min:  9, max:  9, placeholder: '612 345 678' },
  { flag: '🇩🇿', name: 'Algeria',        code: '+213', dialKey: '+213',  min:  9, max:  9, placeholder: '551 234 567' },
  { flag: '🇹🇳', name: 'Tunisia',        code: '+216', dialKey: '+216',  min:  8, max:  8, placeholder: '20 123 456' },
  { flag: '🇧🇷', name: 'Brazil',         code: '+55',  dialKey: '+55',   min: 10, max: 11, placeholder: '11 91234 5678' },
  { flag: '🇲🇽', name: 'Mexico',         code: '+52',  dialKey: '+52',   min: 10, max: 10, placeholder: '55 1234 5678' },
  { flag: '🇦🇷', name: 'Argentina',      code: '+54',  dialKey: '+54',   min: 10, max: 10, placeholder: '11 1234 5678' },
  { flag: '🇨🇴', name: 'Colombia',       code: '+57',  dialKey: '+57',   min: 10, max: 10, placeholder: '310 123 4567' },
  { flag: '🇨🇱', name: 'Chile',          code: '+56',  dialKey: '+56',   min:  9, max:  9, placeholder: '9 1234 5678' },
  { flag: '🇵🇪', name: 'Peru',           code: '+51',  dialKey: '+51',   min:  9, max:  9, placeholder: '912 345 678' },
  { flag: '🇻🇪', name: 'Venezuela',      code: '+58',  dialKey: '+58',   min: 10, max: 10, placeholder: '412 345 6789' },
];

// ── Validation helpers ──────────────────────────────────────────────────────

function validateEmail(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(trimmed)) return 'Please enter a valid email address.';
  return '';
}

function validatePassword(password: string): string {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return '';
}

function validateFullName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 100) return 'Name must be under 100 characters.';
  if (!/^[\p{L}\s'\-]+$/u.test(trimmed)) return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
  return '';
}

function validatePhone(phone: string, country: Country): string {
  if (!phone.trim()) return ''; // optional
  const digits = phone.replace(/[\s\-().]/g, '');
  if (!/^\d+$/.test(digits)) return 'Phone number can only contain digits, spaces, -, and parentheses.';
  if (digits.length < country.min || digits.length > country.max) {
    return country.min === country.max
      ? `${country.name} numbers must be exactly ${country.min} digits (e.g. ${country.placeholder}).`
      : `${country.name} numbers must be ${country.min}–${country.max} digits (e.g. ${country.placeholder}).`;
  }
  return '';
}

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: '', color: 'transparent', width: '0%' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: '#EF4444', width: '33%' };
  if (score <= 3) return { label: 'Medium', color: '#F59E0B', width: '66%' };
  return { label: 'Strong', color: '#22C55E', width: '100%' };
}

// ── Searchable Country Code Picker ──────────────────────────────────────────

function CountryCodePicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(0);

  const selected = COUNTRY_CODES.find(c => c.dialKey === value) ?? COUNTRY_CODES[0];

  const filtered = search.trim()
    ? COUNTRY_CODES.filter(c => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.includes(search) ||
          c.code.replace('+', '').startsWith(search.replace('+', ''))
        );
      })
    : COUNTRY_CODES;

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open) {
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Keyboard navigation
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && filtered[cursor]) {
      e.preventDefault();
      onChange(filtered[cursor].dialKey);
      setOpen(false);
      setSearch('');
    }
    if (e.key === 'Escape') { setOpen(false); setSearch(''); }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    const item = listRef.current?.children[cursor] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '12px 10px', borderRadius: 12, cursor: 'pointer',
          background: 'var(--bg)', border: '1px solid var(--border)',
          color: 'var(--text-primary)', whiteSpace: 'nowrap', minWidth: 82,
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{ fontSize: 16 }}>{selected.flag}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.code}</span>
        <ChevronDown size={12} color="var(--text-muted)" style={{ marginLeft: 2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 9999,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 14, width: 280, overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Search */}
          <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setCursor(0); }}
                onKeyDown={onKeyDown}
                placeholder="Search country or +code…"
                style={{
                  width: '100%', padding: '8px 10px 8px 30px',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                }}
              />
            </div>
          </div>

          {/* List */}
          <div ref={listRef} style={{ overflowY: 'auto', maxHeight: 240 }}>
            {filtered.length === 0 && (
              <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                No results for "{search}"
              </div>
            )}
            {filtered.map((c, i) => (
              <button
                key={c.dialKey}
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => { onChange(c.dialKey); setOpen(false); setSearch(''); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: i === cursor ? 'var(--fire-dim)' : value === c.dialKey ? '#ffffff08' : 'transparent',
                  color: 'var(--text-primary)', transition: 'background 0.1s',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{c.flag}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{c.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'monospace' }}>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Component ───────────────────────────────────────────────────────────────

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(
    params.get('mode') === 'signup' ? 'signup' : 'login'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dialKey, setDialKey] = useState('+1-US');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Brute-force protection: track failed login attempts
  const failedAttempts = useRef(0);
  const lockoutUntil = useRef<number>(0);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  // Reset form state when switching modes
  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setDialKey('+1-US');
    setPhone('');
    setGender('');
    setShowPass(false);
    setShowConfirmPass(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Lockout check
    if (Date.now() < lockoutUntil.current) {
      const secsLeft = Math.ceil((lockoutUntil.current - Date.now()) / 1000);
      setError(`Too many failed attempts. Please wait ${secsLeft} seconds.`);
      return;
    }

    // ── Validate inputs ──
    const emailErr = validateEmail(email);
    if (emailErr) { setError(emailErr); return; }

    const passErr = validatePassword(password);
    if (passErr) { setError(passErr); return; }

    if (mode === 'signup') {
      const nameErr = validateFullName(fullName);
      if (nameErr) { setError(nameErr); return; }

      const selectedCountry = COUNTRY_CODES.find(c => c.dialKey === dialKey) ?? COUNTRY_CODES[0];
      const phoneErr = validatePhone(phone, selectedCountry);
      if (phoneErr) { setError(phoneErr); return; }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          await supabase.from('profiles').update({
            full_name: fullName.trim(),
            phone: phone.trim() ? `${(COUNTRY_CODES.find(c => c.dialKey === dialKey) ?? COUNTRY_CODES[0]).code}${phone.trim()}` : null,
            gender: gender || null,
          }).eq('id', data.user.id);
        }

        setSuccess('Account created! Redirecting...');
        setTimeout(() => router.replace('/dashboard'), 1500);

      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (signInError) throw signInError;

        // Handle "Keep me logged in"
        if (!keepLoggedIn) {
          const supabaseKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
          if (supabaseKey) {
            sessionStorage.setItem(supabaseKey, localStorage.getItem(supabaseKey) ?? '');
            localStorage.removeItem(supabaseKey);
          }
        }

        failedAttempts.current = 0;
        router.replace('/dashboard');
      }
    } catch (err: unknown) {
      failedAttempts.current += 1;

      // Lock out after 5 failed attempts for 60 seconds
      if (failedAttempts.current >= 5) {
        lockoutUntil.current = Date.now() + 60_000;
        failedAttempts.current = 0;
        setError('Too many failed attempts. Please wait 60 seconds before trying again.');
      } else {
        // Normalize Supabase error messages — don't expose internal details
        const raw = err instanceof Error ? err.message : '';
        if (raw.toLowerCase().includes('invalid login credentials')) {
          setError('Incorrect email or password.');
        } else if (raw.toLowerCase().includes('email already registered') || raw.toLowerCase().includes('user already registered')) {
          setError('An account with this email already exists.');
        } else if (raw.toLowerCase().includes('email not confirmed')) {
          setError('Please confirm your email before signing in.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = mode === 'signup' ? getPasswordStrength(password) : null;

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: 15, outline: 'none',
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 700 as const, letterSpacing: 1.5,
    color: 'var(--text-muted)', display: 'block' as const, marginBottom: 6,
  };

  return (
    <main style={{
      background: 'var(--bg)', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <Link href="/" style={{
        position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center',
        gap: 6, color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none',
      }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>HireIQ</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Your CV, brutally improved.</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)', padding: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>

            {/* ── Signup-only fields ── */}
            {mode === 'signup' && (
              <>
                <div>
                  <label style={labelStyle}>FULL NAME</label>
                  <input
                    type="text" value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="John Smith"
                    autoComplete="name"
                    maxLength={100}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    {(() => {
                      const sel = COUNTRY_CODES.find(c => c.dialKey === dialKey) ?? COUNTRY_CODES[0];
                      return (
                        <>
                          <label style={labelStyle}>PHONE (OPTIONAL)</label>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <CountryCodePicker
                              value={dialKey}
                              onChange={key => { setDialKey(key); setPhone(''); }}
                            />
                            <input
                              type="tel" value={phone}
                              onChange={e => setPhone(e.target.value.replace(/[^\d\s\-()]/g, ''))}
                              placeholder={sel.placeholder}
                              autoComplete="tel-national"
                              maxLength={sel.max + 4} // allow for spaces/dashes
                              style={{ ...inputStyle, flex: 1 }}
                            />
                          </div>
                          {phone && (() => {
                            const digits = phone.replace(/[\s\-().]/g, '');
                            const ok = digits.length >= sel.min && digits.length <= sel.max && /^\d+$/.test(digits);
                            return ok
                              ? <p style={{ fontSize: 11, color: '#22C55E', marginTop: 4 }}>Valid {sel.name} number</p>
                              : digits.length > 0
                                ? <p style={{ fontSize: 11, color: '#F59E0B', marginTop: 4 }}>Expected {sel.min === sel.max ? sel.min : `${sel.min}–${sel.max}`} digits for {sel.name}</p>
                                : null;
                          })()}
                        </>
                      );
                    })()}
                  </div>
                  <div>
                    <label style={labelStyle}>GENDER (OPTIONAL)</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const }}
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="prefer_not">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ── Email ── */}
            <div>
              <label style={labelStyle}>EMAIL</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                style={inputStyle}
              />
            </div>

            {/* ── Password ── */}
            <div>
              <label style={labelStyle}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  maxLength={128}
                  style={{ ...inputStyle, padding: '12px 44px 12px 16px' }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength bar — signup only */}
              {passwordStrength && password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: passwordStrength.width,
                      background: passwordStrength.color, borderRadius: 99,
                      transition: 'width 0.3s, background 0.3s',
                    }} />
                  </div>
                  <p style={{ fontSize: 11, color: passwordStrength.color, marginTop: 4 }}>
                    {passwordStrength.label} — min 8 chars, 1 uppercase, 1 number
                  </p>
                </div>
              )}
            </div>

            {/* ── Confirm Password — signup only ── */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>CONFIRM PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPass ? 'text' : 'password'} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    maxLength={128}
                    style={{
                      ...inputStyle, padding: '12px 44px 12px 16px',
                      borderColor: confirmPassword && confirmPassword !== password ? '#EF4444' : undefined,
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirmPass(v => !v)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}>
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === password && (
                  <p style={{ fontSize: 11, color: '#22C55E', marginTop: 4 }}>Passwords match</p>
                )}
              </div>
            )}

            {/* ── Keep me logged in — login only ── */}
            {mode === 'login' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                <div
                  role="checkbox"
                  aria-checked={keepLoggedIn}
                  tabIndex={0}
                  onClick={() => setKeepLoggedIn(v => !v)}
                  onKeyDown={e => e.key === ' ' && setKeepLoggedIn(v => !v)}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${keepLoggedIn ? '#FF4D1C' : 'var(--border)'}`,
                    background: keepLoggedIn ? '#FF4D1C' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s', cursor: 'pointer',
                  }}
                >
                  {keepLoggedIn && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Keep me logged in</span>
              </label>
            )}

            {/* ── Messages ── */}
            {error && (
              <p role="alert" style={{
                fontSize: 13, color: '#FF4D1C', background: '#FF4D1C15',
                border: '1px solid #FF4D1C33', padding: '10px 14px', borderRadius: 10,
              }}>
                {error}
              </p>
            )}
            {success && (
              <p role="status" style={{
                fontSize: 13, color: '#16A34A', background: '#16A34A15',
                border: '1px solid #16A34A33', padding: '10px 14px', borderRadius: 10,
              }}>
                {success}
              </p>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '14px', borderRadius: 12, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #FF4D1C, #FF7A52)',
              color: 'white', fontSize: 15, fontWeight: 700,
              boxShadow: '0 4px 20px #FF4D1C44', opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={switchMode}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}
            >
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span style={{ color: '#FF4D1C', fontWeight: 700 }}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </span>
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6 }}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
