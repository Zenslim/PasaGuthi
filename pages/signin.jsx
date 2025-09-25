// pages/signin.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // If already signed in, go straight to dashboard
  useEffect(() => {
    let sub;
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) router.replace('/dashboard');
    });
    const listener = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace('/dashboard');
    });
    sub = listener?.data?.subscription;
    return () => sub?.unsubscribe();
  }, [router]);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || '';

  async function sendMagicLink(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!email.trim()) {
      setErr('Enter your email.');
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/dashboard`,
      },
    });
    setSending(false);
    if (error) setErr(error.message || 'Could not send magic link.');
    else setMsg('Check your email for the magic link. Open it on this device if possible.');
  }

  async function oauth(provider) {
    setErr('');
    setMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/dashboard` },
    });
    if (error) setErr(error.message || 'Sign-in failed.');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl shadow-2xl bg-slate-900/60 border border-white/10 p-8">
        <h1 className="text-2xl font-bold tracking-tight mb-2">🌿 Enter the Forest</h1>
        <p className="text-sm text-slate-300 mb-6">
          No password. We’ll send a one-time magic link to your email. After you’re in, verify your
          phone (for uniqueness) and later add a passkey for one-tap logins.
        </p>

        <form onSubmit={sendMagicLink} className="space-y-3">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg bg-slate-800 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg px-4 py-3 font-semibold bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 transition"
          >
            {sending ? 'Sending magic link…' : 'Send Magic Link'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-slate-400">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid gap-3">
          <button
            onClick={() => oauth('google')}
            className="w-full rounded-lg px-4 py-3 font-semibold bg-white text-slate-900 hover:bg-slate-100 transition"
          >
            Continue with Google
          </button>
          <button
            onClick={() => oauth('facebook')}
            className="w-full rounded-lg px-4 py-3 font-semibold bg-blue-600 hover:bg-blue-700 transition"
          >
            Continue with Facebook
          </button>
        </div>

        {msg ? (
          <p className="mt-6 text-sm text-emerald-300 bg-emerald-900/20 border border-emerald-800 rounded-lg p-3">
            {msg}
          </p>
        ) : null}
        {err ? (
          <p className="mt-6 text-sm text-rose-300 bg-rose-900/20 border border-rose-800 rounded-lg p-3">
            {err}
          </p>
        ) : null}

        <p className="mt-8 text-xs text-slate-400">
          Tip: The short “Guthi Key” you saw (e.g., <code>mritunjaya-shrestha-4KR2a</code>) is your
          forest tag — keep it safe. Logins use the magic link above; later you can add a passkey in
          your profile for one-tap entry.
        </p>
      </div>
    </main>
  );
}
