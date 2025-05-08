
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { nanoid } from 'nanoid';
import tharList from '../../data/tharList.json';
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
    const guthiKey = \`\${form.name.toLowerCase()}-\${form.thar.toLowerCase()}-\${form.region.toLowerCase()}-\${form.skills.toLowerCase()}-\${nanoid(5)}\`;
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
      setTimeout(() => router.push('/whisper'), 2500);
    } else {
      console.error(error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
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
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold">🌱 Offer Your Guthi Identity</h1>
        <input name="name" required onChange={handleChange} placeholder="First Name" className="border p-2 w-full" />
        <input name="thar" required onChange={handleChange} placeholder="Thar (Surname)" className="border p-2 w-full" />
        {suggestedThar.length > 0 && (
          <ul className="bg-gray-50 border p-2 text-sm">
            {suggestedThar.map((t, i) => (
              <li key={i} onClick={() => setForm(prev => ({ ...prev, thar: t }))}>{t}</li>
            ))}
          </ul>
        )}
        <select name="gender" required onChange={handleChange} className="border p-2 w-full">
          <option value="">Select Gender</option>
          <option value="Male">Sir</option>
          <option value="Female">Ma'am</option>
        </select>
        <input name="region" required onChange={handleChange} placeholder="Your District/Region" className="border p-2 w-full" />
        <input name="skills" required onChange={handleChange} placeholder="Your Skills (e.g. farming, tech)" className="border p-2 w-full" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">🌿 Generate Guthi Key</button>
      </form>
    </div>
  );
}
