// pages/welcome.jsx
// ELI15: You must be signed in first. Then this page plants your "Guthi seed"
// by upserting a row into public.profiles with your Supabase user.id.
// This avoids "null value in column user_id" and avoids the missing `users` table.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { nanoid } from 'nanoid';

// If you already have these JSONs in your repo, keep them.
// If not, you can remove all suggestion bits below and keep the core submit.
// (Keeping them here because they're used elsewhere in your project.)
import tharList from '../data/tharList.json';
import skillsList from '../data/skillsList.json';
import regionList from '../data/regionList.json';
import Fuse from 'fuse.js';

export default function Welcome() {
  const router = useRouter();

  // ---------- 1) AUTH GUARD ----------
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        // Not logged in → send to your sign-in page
        router.replace('/signin');
        return;
      }
      setUser(data.user);
      setAuthReady(true);
    })();
  }, [router]);

  // ---------- 2) FORM STATE ----------
  const [form, setForm] = useState({
    name: '',
    thar: '',
    gender: '',
    region: '',
    skills: ''
  });
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [guthiKey, setGuthiKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ---------- 3) NICE-TO-HAVE SUGGESTIONS ----------
  const tharFuse = new Fuse(tharList || [], { keys: ['Thar'], threshold: 0.3 });
  const regionFuse = new Fuse(regionList || [], { keys: ['Region'], threshold: 0.3 });
  const skillsFuse = new Fuse(skillsList || [], { keys: ['Skill'], threshold: 0.3 });

  const [suggestedThar, setSuggestedThar] = useState([]);
  const [suggestedRegion, setSuggestedRegion] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));

    if (name === 'thar') {
      const results = value.trim() ? tharFuse.search(value.trim()).map(r => r.item) : [];
      setSuggestedThar(results);
    }
    if (name === 'region') {
      const results = value.trim() ? regionFuse.search(value.trim()).map(r => r.item) : [];
      setSuggestedRegion(results);
    }
    if (name === 'skills') {
      const parts = value.split(',');
      const last = parts[parts.length - 1].trim();
      const results = last ? skillsFuse.search(last).map(r => r.item.Skill) : [];
      setSuggestedSkills(results);
    }
  };

  const handleSkillSelect = (skill) => {
    const current = form.skills.split(',').map(s => s.trim()).filter(Boolean);
    if (!current.includes(skill)) {
      const updated = [...current.slice(0, -1), skill];
      setForm(prev => ({ ...prev, skills: updated.join(', ') + ', ' }));
    }
    setSuggestedSkills([]);
  };

  // ---------- 4) SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authReady || !user) return;

    setErrorMsg('');
    setSubmitting(true);

    try {
      // make a human-readable, unique-ish key
      const seedKey = `${(form.name || 'friend').toLowerCase()}-${(form.thar || 'guthi').toLowerCase()}-${nanoid(5)}`;
      setGuthiKey(seedKey);

      // IMPORTANT: write to public.profiles with user_id = user.id
      // Use upsert so repeated submit updates the same row.
      // Adjust columns to match your profiles schema. Keep only safe, common fields.
      const payload = {
        user_id: user.id,          // <- fixes the NOT NULL user_id
        name: form.name || null,
        thar: form.thar || null,
        gender: form.gender || null,
        region: form.region || null,
        skills: form.skills || null,
        phone: phone || null,
        guthi_key: seedKey,        // column expected as snake_case in many setups
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      // cache and go
      localStorage.setItem('guthiKey', seedKey);
      setSubmitted(true);
      setTimeout(() => router.replace('/dashboard'), 1200);
    } catch (err) {
      console.error('❌ profiles upsert failed:', err);
      setErrorMsg(err?.message || 'Could not plant your Guthi seed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
        <p className="text-sm">Checking your session…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">🌿 Seed planted</h1>
          <p className="mt-3">Your Guthi Key:</p>
          <code className="inline-block mt-2 bg-gray-100 px-3 py-2 rounded text-lg">{guthiKey}</code>
          <p className="mt-4 text-purple-700 italic">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        <h1 className="text-2xl font-semibold text-center">🌸 PasaGuthi welcomes you</h1>
        <p className="text-center text-sm text-gray-600">Plant your seed. Begin your journey.</p>

        {errorMsg && (
          <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{errorMsg}</div>
        )}

        {/* Name */}
        <div>
          <label className="block font-semibold">🪶 Name (first name only)</label>
          <input
            name="name"
            required
            onChange={handleChange}
            placeholder="e.g., Nabin"
            className="border bg-white text-black p-2 w-full rounded"
          />
        </div>

        {/* Thar */}
        <div>
          <label className="block font-semibold">🌳 Thar (Lineage)</label>
          <input
            name="thar"
            required
            value={form.thar}
            onChange={handleChange}
            placeholder="e.g., Pradhan"
            className="border bg-white text-black p-2 w-full rounded"
          />
          {suggestedThar.length > 0 && (
            <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
              {suggestedThar.map((t, i) => (
                <li
                  key={i}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setForm(prev => ({ ...prev, thar: t.Thar }));
                    setSuggestedThar([]);
                  }}
                >
                  {t.Thar}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block font-semibold">🌸 How shall we greet you?</label>
          <select
            name="gender"
            required
            onChange={handleChange}
            className="border bg-white text-black p-2 w-full rounded"
          >
            <option value="">Select</option>
            <option value="Male">Sir</option>
            <option value="Female">Ma’am</option>
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block font-semibold">🌍 Region</label>
          <input
            name="region"
            required
            value={form.region}
            onChange={handleChange}
            placeholder="e.g., Patan, Kathmandu — or Boston, USA"
            className="border bg-white text-black p-2 w-full rounded"
          />
          {suggestedRegion.length > 0 && (
            <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
              {suggestedRegion.map((r, i) => (
                <li
                  key={i}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setForm(prev => ({ ...prev, region: r.Region }));
                    setSuggestedRegion([]);
                  }}
                >
                  {r.Region}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Skills */}
        <div>
          <label className="block font-semibold">🤲 Skills (comma separated)</label>
          <input
            name="skills"
            required
            value={form.skills}
            onChange={handleChange}
            placeholder="e.g., sculpting, storytelling, healing"
            className="border bg-white text-black p-2 w-full rounded"
          />
          {suggestedSkills.length > 0 && (
            <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
              {suggestedSkills.map((s, i) => (
                <li
                  key={i}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSkillSelect(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Phone (optional) */}
        <div>
          <label className="block font-semibold">📱 Recovery Phone (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+97798XXXXXXX"
            className="border bg-white text-black p-2 w-full rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used only to help you recover your Guthi Key (OTP), never for marketing.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full font-bold ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {submitting ? 'Planting…' : '🌿 Plant My Guthi Seed'}
        </button>
      </form>
    </div>
  );
}
