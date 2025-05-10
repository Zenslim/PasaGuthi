import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import tharList from '../data/tharList.json';
import skillsList from '../data/skillsList.json';
import regionList from '../data/regionList.json';
import Fuse from 'fuse.js';

export default function Welcome() {
  const router = useRouter();
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
      setConfirmedSkills(updated);
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
    const sporeId = localStorage.getItem('sporeId');
    const guthiKey = `${form.name.toLowerCase()}-${form.thar.toLowerCase()}-${form.region.toLowerCase()}-${nanoid(5)}`;
    setGuthiKey(guthiKey);
    setConfirmedRegion(form.region);

    let hashedPassword = null;
    if (phone && form.password) {
      hashedPassword = await bcrypt.hash(form.password, 10);
    }

    const { error } = await supabase.from('users').insert([{
      sporeId,
      guthiKey,
      phone: phone || null,
      password: hashedPassword,
      ...form,
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
      <div className="min-h-screen flex items-center justify-center bg-white text-black p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">🌸 Welcome, {form.name}</h1>
          <p className="mt-4">Your Guthi Key:</p>
          <code className="text-lg bg-gray-100 p-2 rounded mt-2 inline-block">{guthiKey}</code>
          <button onClick={() => router.push('/dashboard')} className="mt-6 bg-black text-white px-4 py-2 rounded">
            ✨ Enter My Guthi Circle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
      <form onSubmit={handleSubmit} onKeyDown={handleKeyPress} className="w-full max-w-md space-y-5">
        <h1 className="text-2xl font-semibold text-center">🌿 PasaGuthi welcomes you</h1>
        <p className="text-sm text-center text-gray-600">Step into a living network of memory, meaning, and belonging.</p>

        <div>
          <label className="font-semibold block">🪶 Name</label>
          <input name="name" required onChange={handleChange} className="p-2 w-full border rounded bg-white" />
        </div>

        <div>
          <label className="font-semibold block">🌳 Thar (Lineage)</label>
          <input name="thar" required onChange={handleChange} value={form.thar} className="p-2 w-full border rounded bg-white" />
          {suggestedThar.length > 0 && (
            <ul className="bg-gray-50 border p-2 rounded text-sm mt-1">
              {suggestedThar.map((t, i) => (
                <li key={i} className="cursor-pointer hover:bg-gray-100" onClick={() => {
                  setForm(prev => ({ ...prev, thar: t.Thar }));
                  setConfirmedThar(t.Thar);
                  setSuggestedThar([]);
                }}>{t.Thar}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="font-semibold block">🌸 Gender</label>
          <select name="gender" required onChange={handleChange} className="p-2 w-full border rounded bg-white">
            <option value="">Select</option>
            <option value="Male">Sir</option>
            <option value="Female">Ma'am</option>
          </select>
        </div>

        <div>
          <label className="font-semibold block">🌍 Region</label>
          <input name="region" required onChange={handleChange} value={form.region} className="p-2 w-full border rounded bg-white" />
          {suggestedRegion.length > 0 && (
            <ul className="bg-gray-50 border p-2 rounded text-sm mt-1">
              {suggestedRegion.map((r, i) => (
                <li key={i} className="cursor-pointer hover:bg-gray-100" onClick={() => {
                  setForm(prev => ({ ...prev, region: r.Region }));
                  setConfirmedRegion(r.Region);
                  setSuggestedRegion([]);
                }}>{r.Region}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="font-semibold block">🤲 Skills</label>
          <input name="skills" required onChange={handleChange} value={form.skills} className="p-2 w-full border rounded bg-white" />
          {suggestedSkills.length > 0 && (
            <ul className="bg-gray-50 border p-2 rounded text-sm mt-1">
              {suggestedSkills.map((s, i) => (
                <li key={i} className="cursor-pointer hover:bg-gray-100" onClick={() => handleSkillSelect(s)}>{s}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="font-semibold block">📱 Phone (optional)</label>
          <input type="tel" value={phone} onChange={handlePhoneChange} className="p-2 w-full border rounded bg-white" placeholder="+97798xxxxxxx" />
          {phone && (
            <div className="mt-2">
              <label className="block font-semibold">🔐 Create Password</label>
              <input type="password" name="password" required onChange={handleChange} className="p-2 w-full border rounded bg-white" />
              <p className="text-xs text-gray-500 mt-1">This will let you log in on older devices.</p>
            </div>
          )}
          {!phone && (
            <p className="text-red-700 mt-2 text-sm">
              ⚠️ Without a phone, recovery is not possible. If you lose your Guthi Key, you must create a new one.
            </p>
          )}
        </div>

        <button type="submit" className="bg-green-700 text-white w-full py-2 rounded font-bold hover:bg-green-800">
          🌱 Plant My Guthi Seed
        </button>
      </form>
    </div>
  );
}
