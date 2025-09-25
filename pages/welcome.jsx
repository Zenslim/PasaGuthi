// pages/welcome.jsx
// ELI15:
// - Must be signed in.
// - Phone is REQUIRED and must be UNIQUE across profiles.
// - If a profile already exists for this user OR the phone is taken, we DO NOT insert a new row.
// - No auto-redirect anywhere. User stays until they click "Go to Dashboard".

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { nanoid } from 'nanoid';

// Optional lists; remove if unused
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
    skills: '' // user types: "doctor, sculptor, healer"
  });
  const [phone, setPhone] = useState(''); // REQUIRED & UNIQUE
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [guthiKey, setGuthiKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState(''); // shown when already registered

  // ---------- 3) OPTIONAL SUGGESTIONS ----------
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

  // ---------- 4) SUBMIT (with uniqueness checks) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authReady || !user) return;

    setErrorMsg('');
    setNoticeMsg('');
    setSubmitting(true);

    try {
      // A human-friendly, unique-ish key
      const seedKey = `${(form.name || 'friend').toLowerCase()}-${(form.thar || 'guthi').toLowerCase()}-${nanoid(5)}`;
      setGuthiKey(seedKey);

      // Convert comma string -> text[] for Postgres
      const skillsArray = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // ---- A) Check if a profile already exists for THIS AUTH USER ----
      const { data: existingForUser, error: findUserErr } = await supabase
        .from('profiles')
        .select('id, guthi_key, phone')
        .eq('user_id', user.id)
        .maybeSingle();
      if (findUserErr) throw findUserErr;

      if (existingForUser?.id) {
        // Already registered → DO NOT insert/update. Just show their key & a gentle notice.
        setGuthiKey(existingForUser.guthi_key || '');
        setSubmitted(true);
        setNoticeMsg('You have already planted your seed. Use the button below to enter your dashboard.');
        setSubmitting(false);
        return;
      }

      // ---- B) Enforce PHONE REQUIRED & UNIQUE across profiles ----
      const phoneTrim = (phone || '').trim();
      if (!phoneTrim) {
        setErrorMsg('Phone number is required to create your Guthi identity.');
        setSubmitting(false);
        return;
      }

      // Optional: very simple sanity check (you can replace with your own)
      const looksLikePhone = /^\+?\d[\d\s\-()]{7,}$/.test(phoneTrim);
      if (!looksLikePhone) {
        setErrorMsg('Please enter a valid phone number (include country code, e.g., +97798XXXXXXX).');
        setSubmitting(false);
        return;
      }

      // Check if any OTHER profile already uses this phone
      const { data: phoneOwner, error: phoneErr } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('phone', phoneTrim)
        .maybeSingle();
      if (phoneErr) throw phoneErr;
      if (phoneOwner?.id) {
        setErrorMsg('This phone number is already registered. Please use a different number or sign in with the original account.');
        setSubmitting(false);
        return;
      }

      // ---- C) Insert brand-new profile for this user ----
      const payload = {
        user_id: user.id,
        name: form.name || null,
        thar: form.thar || null,
        gender: form.gender || null,
        region: form.region || null,
        skills: skillsArray,         // text[] expects array
        phone: phoneTrim,            // REQUIRED + UNIQUE (enforced here)
        guthi_key: seedKey
        // created_at: let DB default handle it
      };

      const { error: insErr } = await supabase
        .from('profiles')
        .insert([payload]);
      if (insErr) throw insErr;

      localStorage.setItem('guthiKey', seedKey);
      setSubmitted(true); // Show success screen (no auto-redirect)
    } catch (err) {
      console.error('❌ profile save failed:', err);
      setErrorMsg(err?.message || 'Could not plant your Guthi seed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- 5) SUCCESS SCREEN (static until button click) ----------
  const goDashboardNow = () => {
    try {
      window.location.assign('/dashboard'); // full reload to /dashboard
    } catch {
      window.location.href = '/dashboard';
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
        <div className="max-w-lg w-full">
          <h1 className="text-2xl font-bold">🌿 Seed planted</h1>

          {noticeMsg ? (
            <p className="mt-3 text-amber-700">{noticeMsg}</p>
          ) : (
            <p className="mt-3">Your Guthi Key:</p>
          )}

          {guthiKey && (
            <code className="inline-block mt-2 bg-gray-100 px-3 py-2 rounded text-lg break-all">
              {guthiKey}
            </code>
          )}

          <p className="mt-4 text-gray-700">
            Keep this safe. It’s also saved in your browser for now.
          </p>

          <div className="mt-6">
            <button
              onClick={goDashboardNow}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold w-full"
            >
              🚀 Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- 6) FORM UI ----------
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
            placeholder="e.g., doctor, sculptor, healer"
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
          <p className="text-xs text-gray-500 mt-1">Tip: type a skill, add a comma, keep going.</p>
        </div>

        {/* Phone (REQUIRED & UNIQUE) */}
        <div>
          <label className="block font-semibold">📱 Recovery Phone (required, unique)</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+97798XXXXXXX"
            className="border bg-white text-black p-2 w-full rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used for OTP recovery of your Guthi Key. Never for marketing.
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
