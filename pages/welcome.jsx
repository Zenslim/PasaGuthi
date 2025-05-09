import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { nanoid } from 'nanoid';
import tharList from '../data/tharList.json';
import Fuse from 'fuse.js';

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
  const [guthiKey, setGuthiKey] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [regionHistory, setRegionHistory] = useState([]);
  const [skillsHistory, setSkillsHistory] = useState([]);

  const fuse = new Fuse(tharList, {
    keys: ['Thar'],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: false,
    useExtendedSearch: true
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('sporeId') || crypto.randomUUID();
      localStorage.setItem('sporeId', id);

      const regions = JSON.parse(localStorage.getItem('regionHistory') || '[]');
      const skills = JSON.parse(localStorage.getItem('skillsHistory') || '[]');
      setRegionHistory(regions);
      setSkillsHistory(skills);
    }
  }, []);

  const detectRegion = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await res.json();
      if (data?.address?.county || data?.address?.state) {
        setForm(prev => ({ ...prev, region: data.address.county || data.address.state }));
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'thar') {
      const input = value.trim();
      const results = fuse.search(`^${input}`).map(r => r.item);
      setSuggestedThar(results);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sporeId = localStorage.getItem('sporeId');
    const guthiKey = `${form.name.toLowerCase()}-${form.thar.toLowerCase()}-${form.region.toLowerCase()}-${form.skills.toLowerCase()}-${nanoid(5)}`;
    setGuthiKey(guthiKey);

    const { error } = await supabase.from('users').insert([{
      sporeId,
      guthiKey,
      phone: phone || null,
      ...form,
      karma: 0,
      createdAt: new Date().toISOString()
    }]);

    if (!error) {
      localStorage.setItem('guthiKey', guthiKey);
      localStorage.setItem('regionHistory', JSON.stringify([...new Set([form.region, ...regionHistory])].slice(0, 10)));
      localStorage.setItem('skillsHistory', JSON.stringify([...new Set([form.skills, ...skillsHistory])].slice(0, 10)));
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
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        <h1 className="text-xl font-bold text-center">🌿 The forest welcomes you.</h1>
        <p className="text-center text-sm text-gray-600">Enter your sacred Guthi identity to be remembered.</p>

        <div>
          <label className="block font-semibold">🪶 Your Name</label>
          <input name="name" required onChange={handleChange} placeholder="First Name" className="border bg-white text-black p-2 w-full rounded" />
        </div>

        <div>
          <label className="block font-semibold">🌳 Your Thar</label>
          <input name="thar" required onChange={handleChange} placeholder="Thar (Surname)" className="border bg-white text-black p-2 w-full rounded" />
          {suggestedThar.length > 0 && (
            <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
              {suggestedThar.map((t, i) => (
                <li key={i} className="cursor-pointer hover:bg-gray-100" onClick={() => setForm(prev => ({ ...prev, thar: t.Thar }))}>{t.Thar}</li>
              ))}
            </ul>
          )}
          {form.thar && tharList.some(t => t.Thar.toLowerCase() === form.thar.toLowerCase()) && (
            <p className="mt-2 text-sm text-green-700 italic">
              ✨ {tharList.find(t => t.Thar.toLowerCase() === form.thar.toLowerCase())?.Meaning}
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
          <div className="flex space-x-2">
            <input name="region" required onChange={handleChange} list="regionList" placeholder="Your District/Region" value={form.region} className="border bg-white text-black p-2 w-full rounded" />
            <datalist id="regionList">
              {regionHistory.map((r, i) => <option key={i} value={r} />)}
            </datalist>
            <button type="button" onClick={detectRegion} className="text-sm text-blue-600 underline">📍 Detect</button>
          </div>
        </div>

        <div>
          <label className="block font-semibold">👐 Your Skills</label>
          <input name="skills" required onChange={handleChange} list="skillsList" placeholder="Your Skills (e.g. farming, design)" value={form.skills} className="border bg-white text-black p-2 w-full rounded" />
          <datalist id="skillsList">
            {skillsHistory.map((s, i) => <option key={i} value={s} />)}
          </datalist>
        </div>

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full font-bold">🌿 Generate My Guthi Key</button>
      </form>
    </div>
  );
}
