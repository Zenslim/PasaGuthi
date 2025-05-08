
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
  const [suggestedThar, setSuggestedThar] = useState([]);
  const [guthiKey, setGuthiKey] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fuse = new Fuse(tharList, { keys: ['name'], threshold: 0.4 });

  useEffect(() => {
    const id = localStorage.getItem('sporeId') || crypto.randomUUID();
    localStorage.setItem('sporeId', id);
  }, []);

  const detectRegion = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json\`);
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
      const results = fuse.search(value).map(r => r.item.name);
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
      ...form,
      karma: 0,
      createdAt: new Date().toISOString()
    }]);

    if (!error) {
      localStorage.setItem('guthiKey', guthiKey);
      setSubmitted(true);
      setTimeout(() => router.push('/whisper'), 3000);
    } else {
      console.error(error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center text-black">
        <div>
          <h1 className="text-2xl font-bold">🌿 Welcome, {form.name}</h1>
          <p className="mt-4">Your Guthi Key:</p>
          <code className="text-lg bg-gray-100 p-2 rounded mt-2 inline-block">{guthiKey}</code>
          <p className="mt-4">The forest will now remember you. Returning to whisper...</p>
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
          <label className="block font-semibold">🪶 Your Name — What should we call your soul when it returns?</label>
          <input name="name" required onChange={handleChange} placeholder="First Name" className="border bg-white text-black p-2 w-full rounded" />
        </div>

        <div>
          <label className="block font-semibold">🌳 Your Thar — From which branch of the sacred tree do you descend?</label>
          <input name="thar" required onChange={handleChange} placeholder="Thar (Surname)" className="border bg-white text-black p-2 w-full rounded" />
          {suggestedThar.length > 0 && (
            <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
              {suggestedThar.map((t, i) => (
                <li key={i} className="cursor-pointer hover:bg-gray-100" onClick={() => setForm(prev => ({ ...prev, thar: t }))}>{t}</li>
              ))}
            </ul>
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
          <label className="block font-semibold">🗺️ Your Region — Which soil has touched your feet?</label>
          <div className="flex space-x-2">
            <input name="region" required onChange={handleChange} placeholder="Your District/Region" value={form.region} className="border bg-white text-black p-2 w-full rounded" />
            <button type="button" onClick={detectRegion} className="text-sm text-blue-600 underline">📍 Detect</button>
          </div>
        </div>

        <div>
          <label className="block font-semibold">👐 Your Skills — What gift do you carry in your hands?</label>
          <input name="skills" required onChange={handleChange} placeholder="Your Skills (e.g. farming, design)" className="border bg-white text-black p-2 w-full rounded" />
        </div>

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full font-bold">🌿 Generate My Guthi Key</button>
      </form>
    </div>
  );
}
