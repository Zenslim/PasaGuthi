// lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Hard fail early if env vars aren’t present (prevents “No API key found” 400s)
if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing (set it in Vercel env).");
if (!anon) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing (set it in Vercel env).");

// One shared browser/client instance (RLS-friendly)
export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,       // keeps the user session in the browser
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
