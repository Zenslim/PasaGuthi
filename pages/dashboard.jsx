// pages/dashboard.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', thar: '', region: '', skills: '', phone: '' });

  useEffect(() => {
   const fetchUser = async () => {
  const sporeId = localStorage.getItem('sporeId');
  if (!sporeId) return;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('sporeId', sporeId);

  console.log("SporeId from localStorage:", sporeId);
  console.log("Fetched Supabase Data:", data);
  console.log("Error:", error);

  if (error) {
    console.error('❌ Supabase fetch error:', error);
  } else if (data?.[0]) {
    setUserData(data[0]);
    setForm({
      name: data[0].name,
      thar: data[0].thar,
      region: data[0].region,
      skills: data[0].skills,
      phone: data[0].phone
    });
  }
  setLoading(false);
};
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const sporeId = localStorage.getItem('sporeId');
    const { error } = await supabase
      .from('users')
      .update(form)
      .eq('sporeId', sporeId);

    if (!error) {
      setUserData({ ...userData, ...form });
      setEditMode(false);
    } else {
      console.error('❌ Update failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-lg">
        🌙 Summoning your Guthi Circle...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-center text-red-400 text-lg">
        ❌ No Guthi member found. <br /> Please complete your welcome ritual.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/50 rounded-xl shadow-xl p-6 border border-green-700 space-y-4">
        <h1 className="text-pink-400 text-2xl font-bold text-center">
          🌸 Welcome, {userData.name}
        </h1>

        {editMode ? (
          <div className="space-y-3">
            <InputField label="Name" name="name" value={form.name} onChange={handleChange} />
            <InputField label="Thar" name="thar" value={form.thar} onChange={handleChange} />
            <InputField label="Region" name="region" value={form.region} onChange={handleChange} />
            <InputField label="Skills" name="skills" value={form.skills} onChange={handleChange} />
            <InputField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <button
              onClick={handleUpdate}
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
            >
              💾 Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-green-300 text-sm">
            <p><strong>Thar:</strong> {userData.thar}</p>
            <p><strong>Region:</strong> {userData.region}</p>
            <p><strong>Skills:</strong> {userData.skills}</p>
            <p><strong>Phone:</strong> {userData.phone}</p>
            <p><strong>Karma:</strong> {userData.karma}</p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
            >
              ✏️ Edit Profile
            </button>

            <Link href="/grove/ritual" legacyBehavior>
              <a className="block mt-6 text-center text-green-400 hover:text-green-600 underline text-sm">
                🌿 Visit Ritual Garden
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400"
      />
    </div>
  );
}
