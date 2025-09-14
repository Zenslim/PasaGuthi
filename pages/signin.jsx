// pages/signin.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // If already signed in, bounce to editor or dashboard
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/blog/new");
    });
  }, [router]);

  async function signInGoogle() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/blog/new" },
    });
    if (error) { setMsg(error.message); setBusy(false); }
  }

  async function sendMagicLink(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/blog/new" },
    });
    setBusy(false);
    setMsg(error ? error.message : "Magic link sent. Check your email.");
  }

  return (
    <main className="min-h-screen grid place-items-center bg-black text-white px-4">
      <div className="w-full max-w-md space-y-6 bg-zinc-950/60 border border-zinc-800 p-6 rounded-2xl">
        <h1 className="text-2xl font-bold">Enter Pasaguthi</h1>
        <p className="text-sm text-zinc-400">
          Sign in to publish to the Ritual Feed.
        </p>

        <button
          onClick={signInGoogle}
          disabled={busy}
          className="w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-zinc-500">
          <div className="h-px flex-1 bg-zinc-800" /><span className="text-xs">or</span><div className="h-px flex-1 bg-zinc-800" />
        </div>

        <form onSubmit={sendMagicLink} className="space-y-3">
          <input
            type="email"
            required
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
          >
            Send magic link
          </button>
        </form>

        {msg ? <p className="text-sm text-emerald-300">{msg}</p> : null}

        <p className="text-xs text-zinc-500">
          Need to go back? <a href="/" className="underline hover:no-underline">Home</a>
        </p>
      </div>
    </main>
  );
}
