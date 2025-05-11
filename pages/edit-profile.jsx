
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import withAuth from '../components/withAuth';

function EditProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    thar: '',
    region: '',
    skills: '',
    phone: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const guthiKey = localStorage.getItem('guthiKey');
    if (!guthiKey) return;
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('guthiKey', guthiKey.trim())
        .limit(1);
      if (data && data.length > 0) {
        setForm({
          name: data[0].name,
          thar: data[0].thar,
          region: data[0].region,
          skills: data[0].skills,
          phone: data[0].phone || '',
          password: ''
        });
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const guthiKey = localStorage.getItem('guthiKey');
    const updated = { ...form };
    if (!updated.password) delete updated.password;

    const { error } = await supabase
      .from('users')
      .update(updated)
      .eq('guthiKey', guthiKey.trim());

    if (!error) {
      setMessage('✅ Profile updated successfully.');
      if (form.name) localStorage.setItem('userName', form.name);
    } else {
      setMessage('❌ Failed to update profile.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4 py-12">
      <h1 className="text-xl font-bold mb-4">✏️ Edit Guthi Profile</h1>
      <div className="w-full max-w-md space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" />
        <input name="thar" value={form.thar} onChange={handleChange} placeholder="Thar" className="w-full border p-2 rounded" />
        <input name="region" value={form.region} onChange={handleChange} placeholder="Region" className="w-full border p-2 rounded" />
        <input name="skills" value={form.skills} onChange={handleChange} placeholder="Skills (comma-separated)" className="w-full border p-2 rounded" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full border p-2 rounded" />
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="New Password (optional)" className="w-full border p-2 rounded" />

        <button onClick={handleUpdate} className="w-full bg-green-600 text-white py-2 rounded font-semibold">
          💾 Save Profile
        </button>
        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </div>
    </div>
  );
}

export default withAuth(EditProfile);
