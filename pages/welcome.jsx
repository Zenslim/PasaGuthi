// pages/welcome.jsx
import bcrypt from 'bcryptjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { nanoid } from 'nanoid';
import tharList from '../data/tharList.json';
import skillsList from '../data/skillsList.json';
import regionList from '../data/regionList.json';
import Fuse from 'fuse.js';

export default function Welcome() {
  const router = useRouter();

  // ---- AUTH GUARD: must have a Supabase user so any future profile writes have user_id ----
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // not signed in → route to your sign-in screen
        router.replace('/signin');
        return;
      }
      setUser(user);
      setAuthChecked(true);
    })();
  }, [router]);

  const [form, setForm] = useState({
    name: '',
    thar: '',
    gender: '',
    region: '',
    skills: '',
    password: ''
  });
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [suggestedThar, setSuggestedThar] = useState([]);
  const [suggestedRegion, setSuggestedRegion] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [confirmedThar, setConfirmedThar] = useState('');
  const [confirmedSkills, setConfirmedSkills] = useState([]);
  const [confirmedRegion, setConfirmedRegion] = useState('');
  const [guthiKey, setGuthiKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const tharFuse = new Fuse(tharList, { keys: ['Thar'], threshold: 0.3 });
  const regionFuse = new Fuse(regionList, { keys: ['Region'], threshold: 0.3 });
  const skillsFuse = new Fuse(skillsList, { keys: ['Skill'], threshold: 0.3 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'thar') {
      const results = tharFuse.search(value.trim()).map(r => r.item);
      setSuggestedThar(results);
      setConfirmedThar('');
    }
    if (name === 'region') {
      const results = regionFuse.search(value.trim()).map(r => r.item);
      setSuggestedRegion(results);
      setConfirmedRegion('');
    }
    if (name === 'skills') {
      const parts = value.split(',');
      const last = parts[parts.length - 1].trim();
      if (last.length > 0) {
        const results = skillsFuse.search(last).map(r => r.item.Skill);
        setSuggestedSkills(results);
      } else {
        setSuggestedSkills([]);
      }
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const finalSkills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      setConfirmedSkills(finalSkills);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    setShowPassword(value.trim().length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authChecked || !user) return;

    setErrorMsg('');
    setSubmitting(true);
    try {
      const seedKey = `${form.name.toLowerCase()}-${form.thar.toLowerCase()}-${form.region.toLowerCase()}-${form.skills.toLowerCase()}-${nanoid(5)}`;
      setGuthiKey(seedKey);
      setConfirmedRegion(form.region);

      let hashedPassword = null;
      if (phone && form.password) {
        hashedPassword = await bcrypt.hash(form.password, 10);
      }

      // Write into the public directory table (no profiles write here)
      const { error } = await supabase.from('users').insert([{
        guthiKey: seedKey,
        name: form.name,
        thar: form.thar,
        gender: form.gender,
        region: form.region,
        skills: form.skills,
        phone: phone || null,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      }]);

      if (error) throw error;

      // cache key for later flows
      localStorage.setItem('guthiKey', seedKey);
      setSubmitted(true);

      // gentle redirect to dashboard after a short beat
      setTimeout(() => router.replace('/dashboard'), 1200);
    } catch (err) {
      console.error('❌ Supabase insert failed:', err);
      setErrorMsg(err?.message || 'Failed to plant your Guthi seed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
        <p className="text-sm">Checking your session…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center text-black">
        <div>
          <h1 className="text-2xl font-bold">🌿 Welcome, {form.name || 'Friend'} of the {form.thar || 'Guthi'} lineage</h1>
          <p className="mt-4">Your Guthi Key:</p>
          <code className="text-lg bg-gray-100 p-2 rounded mt-2 inline-block">{guthiKey}</code>
          <p className="mt-4 text-purple-700 italic">🌸 Seed planted. Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
      <form onSubmit={handleSubmit} onKeyDown={handleKeyPress} className="w-full max-w-md space-y-5">
        <h1 className="text-2xl font-semibold text-center">🌸 PasaGuthi welcomes you.</h1>
        <p className="text-center text-sm text-gray-600 mt-1">Step into a living network of memory, meaning, and belonging.</p>

        {errorMsg && (
          <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{errorMsg}</div>
        )}

        {/* Name */}
        <div>
          <label className="block font-semibold">🪶 What name do the winds call you by?</label>
          <input name="name" required onChange={handleChange} placeholder="e.g., Nabin" className="border bg-white text-black p-2 w-full rounded" />
        </div>

        {/* Thar */}
        <div>
          <label className="block font-semibold">🌳 Your Thar (Lineage)</label>
          <p className="text-sm text-gray-500 italic mb-1">This binds you to your ancestral tree.</p>
          <input name="thar" required onChange={handleChange} value={form.thar} placeholder="e.g., Pradhan" className="border bg-white text-black p-2 w-full rounded" />
          {suggestedThar.length > 0 && (
            <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
              {suggestedThar.map((t, i) => (
                <li key={i} className="cursor-pointer hover:bg-gray-100" onClick={() => {
                  setForm(prev => ({ ...prev, thar: t.Thar }));
                  setConfirmedThar(t.Thar);
                  setSuggestedThar([]);
                }}>{t.Thar}</li>
              ))}
            </ul>
          )}
          {confirmedThar && (
            <p className="mt-2 text-sm text-green-700 italic">
              ✨ Aha, {confirmedThar} — {tharList.find(t => t.Thar.toLowerCase() === confirmedThar.toLowerCase())?.Meaning}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block font-semibold">🌸 How shall the Guthi greet you?</label>
          <select name="gender" required onChange={handleChange} className="border bg-white text-black p-2 w-full rounded">
            <option value="">Select</option>
            <option value="Male">With respect as Sir</option>
            <option value="Female">With honor as Ma’am</option>
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block font-semibold">🌍 Where do your roots now breathe?</label>
          <p className="text-sm text-gray-500 italic mb-1">This will blossom with meaning.</p>
          <input name="region" required onChange={handleChange} value={form.region} placeholder="e.g., Patan, Kathmandu — or Boston, USA" className="border bg-white text-black p-2 w-full rounded" />
          {suggestedRegion.length > 0 && (
            <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
              {suggestedRegion.map((r, i) => (
                <li key={i} className="cursor-pointer hover:bg-gray-100" onClick={() => {
                  setForm(prev => ({ ...prev, region: r.Region }));
                  setConfirmedRegion(r.Region);
                  setSuggestedRegion([]);
                }}>{r.Region}</li>
              ))}
            </ul>
          )}
          {confirmedRegion && (
            <p className="mt-2 text-sm text-green-700 italic">
              ✨ Aha, {regionList.find(r => r.Region.toLowerCase() === confirmedRegion.toLowerCase())?.Meaning || "not yet in our sacred list. You are the first to speak it here."}
            </p>
          )}
        </div>

        {/* Skills */}
        <div>
          <label className="block font-semibold">🤲 What gifts do you offer the Guthi?</label>
          <p className="text-sm text-gray-500 italic mb-1">Each gift will be honored with a whisper.</p>
          <input name="skills" required onChange={handleChange} value={form.skills} placeholder="e.g., sculpting, storytelling, healing" className="border bg-white text-black p-2 w-full rounded" />
          {suggestedSkills.length > 0 && (
            <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
              {suggestedSkills.map((s, i) => (
                <li key={i} className="cursor-pointer hover:bg-gray-100" onClick={() => handleSkillSelect(s)}>{s}</li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-500 mt-1">Type a skill and press Enter to confirm — every offering adds to the sacred weave.</p>
          {confirmedSkills.length > 0 && (
            <div className="mt-2 space-y-1 text-sm text-green-700 italic">
              {confirmedSkills.map((s, i) => {
                const match = skillsList.find(k => k.Skill.toLowerCase() === s.toLowerCase());
                return (
                  <p key={i}>✨ Aha, {s} — {match ? match.Meaning : "not yet in our sacred list. You are the first to speak it here."}</p>
                );
              })}
            </div>
          )}
        </div>

        {/* Phone + Password */}
        <div className="mt-4">
          <label className="block font-semibold">📱🔑 Recovery Number (Optional)</label>
          <input type="tel" placeholder="+97798XXXXXXX" value={phone} onChange={handlePhoneChange} className="w-full mt-2 p-2 border rounded" />
          {showPassword && (
            <>
              <label className="block font-semibold mt-3">🔐 Create a Password</label>
              <input type="password" name="password" required placeholder="Enter a strong password" onChange={handleChange} className="w-full mt-2 p-2 border rounded" />
              <p className="text-xs text-gray-500 mt-1">This will let you log in on older devices without biometrics.</p>
            </>
          )}
          {!showPassword && (
            <p className="mt-2 font-medium text-red-700">
              If you lose your Guthi Key, this is the only way to retrieve it. Without it, you will have to create again from scratch.
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">Why do we ask this? It’s not for marketing. Only to help you retrieve your Guthi Key if forgotten.</p>
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
