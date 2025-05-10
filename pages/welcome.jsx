import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { nanoid } from 'nanoid';
import tharList from '../data/tharList.json';
import skillsList from '../data/skillsList.json';
import regionList from '../data/regionList.json';
import Fuse from 'fuse.js';
import bcrypt from 'bcryptjs';

export default function Welcome() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    thar: '',
    gender: '',
    region: '',
    skills: ''
  });
  const [phone, setPhone] = useState('');
  const [suggestedThar, setSuggestedThar] = useState([]);
  const [suggestedRegion, setSuggestedRegion] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [skillTags, setSkillTags] = useState([]);
  const [confirmedThar, setConfirmedThar] = useState('');
  const [confirmedSkills, setConfirmedSkills] = useState([]);
  const [confirmedRegion, setConfirmedRegion] = useState('');
  const [guthiKey, setGuthiKey] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const tharFuse = new Fuse(tharList, { keys: ['Thar'], threshold: 0.3 });
  const regionFuse = new Fuse(regionList, { keys: ['Region'], threshold: 0.3 });
  const skillsFuse = new Fuse(skillsList, { keys: ['Skill'], threshold: 0.3 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('sporeId') || crypto.randomUUID();
      localStorage.setItem('sporeId', id);
    }
  }, []);

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
      setSkillTags(updated);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
        const guthiKey = `${form.name.toLowerCase()}-${form.thar.toLowerCase()}-${form.region.toLowerCase()}-${form.skills.toLowerCase()}-${nanoid(5)}`;
    setGuthiKey(guthiKey);

    setConfirmedRegion(form.region);

    const hashedPassword = await bcrypt.hash(form.password, 10);
    const { error } = await supabase.from('users').insert([{
      
      guthiKey,
      phone: phone || null,
      ...form,
      password: hashedPassword,
      karma: 0,
      createdAt: new Date().toISOString()
    }]);

    if (!error) {
      localStorage.setItem('guthiKey', guthiKey);
      setSubmitted(true);
    } else {
      console.error('❌ Supabase insert failed:', error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center text-black">
        <div>
          <h1 className="text-2xl font-bold">🌿 Welcome, {form.name}</h1>
          <p className="mt-4">Your Guthi Key:</p>
          <code className="text-lg bg-gray-100 p-2 rounded mt-2 inline-block">{guthiKey}</code>

          <div className="mt-6 text-sm text-gray-700">
            <label className="block font-semibold">📱🔑 Recovery Number (Optional)</label>
            <input
              type="tel"
              placeholder="+97798XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full max-w-sm mt-2 p-2 border rounded"
            />
            <p className="mt-2 font-medium text-red-700">
              If you lose your Guthi Key, this is the only way to retrieve it. Without it, you will have to create again from scratch.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Why do we ask this? It’s not for marketing. Only to help you retrieve your Guthi Key if forgotten.
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 bg-black text-white px-4 py-2 rounded"
          >
            🌀 Enter Your Guthi Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
      <form onSubmit={handleSubmit} onKeyDown={handleKeyPress} className="w-full max-w-md space-y-5">
        <h1 className="text-xl font-bold text-center">🌿 The forest welcomes you.</h1>
        <p className="text-center text-sm text-gray-600">Enter your sacred Guthi identity to be remembered.</p>

        <div>
          <label className="block font-semibold">🪶 Your Name</label>
          <input name="name" required onChange={handleChange} placeholder="First Name" className="border bg-white text-black p-2 w-full rounded" />
        </div>

        <div>
          <label className="block font-semibold">🌳 Your Thar</label>
          <input name="thar" required onChange={handleChange} value={form.thar} placeholder="Thar (Surname)" className="border bg-white text-black p-2 w-full rounded" />
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

        <div>
          <label className="block font-semibold">🌸 How shall we address you?</label>
          <select name="gender" required onChange={handleChange} className="border bg-white text-black p-2 w-full rounded">
            <option value="">Select</option>
            <option value="Male">Sir</option>
            <option value="Female">Ma'am</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">🗺️ Your Region</label>
          <input name="region" required onChange={handleChange} value={form.region} placeholder="Your District/Region" className="border bg-white text-black p-2 w-full rounded" />
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

        <div>
          <label className="block font-semibold">👐 Your Skills</label>
          <input name="skills" required onChange={handleChange} value={form.skills} placeholder="e.g. farming, design, healing" className="border bg-white text-black p-2 w-full rounded" />
          {suggestedSkills.length > 0 && (
            <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
              {suggestedSkills.map((s, i) => (
                <li key={i} className="cursor-pointer hover:bg-gray-100" onClick={() => handleSkillSelect(s)}>{s}</li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Type a skill and press Enter to confirm — each will be honored with meaning.
          </p>
          {confirmedSkills.length > 0 && (
            <div className="mt-2 space-y-1 text-sm text-green-700 italic">
              {confirmedSkills.map((s, i) => {
                const match = skillsList.find(k => k.Skill.toLowerCase() === s.toLowerCase());
                return (
                  <p key={i}>
                    ✨ Aha, {s} — {match ? match.Meaning : "not yet in our sacred list. You are the first to speak it here."}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        
        <div>
          <label className="block font-semibold">🔐 Create a Password (for fallback login)</label>
          <input
            type="password"
            name="password"
            required
            onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
            className="border bg-white text-black p-2 w-full rounded"
            placeholder="Create a secure password"
          />
        </div>

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full font-bold">🌿 Generate My Guthi Key</button>
      </form>
    </div>
  );
}
