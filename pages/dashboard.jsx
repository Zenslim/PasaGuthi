import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        🌙 Summoning your Guthi Circle...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        ❌ No Guthi member found. Please join first.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-4">
      <h1 className="text-2xl font-bold">🌸 Welcome, {userData.name}</h1>
      {editMode ? (
        <div className="space-y-3">
          <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 rounded text-black" />
          <input name="thar" value={form.thar} onChange={handleChange} className="w-full p-2 rounded text-black" />
          <input name="region" value={form.region} onChange={handleChange} className="w-full p-2 rounded text-black" />
          <input name="skills" value={form.skills} onChange={handleChange} className="w-full p-2 rounded text-black" />
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 rounded text-black" />
          <button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white">Save</button>
        </div>
      ) : (
        <div className="space-y-1">
          <p><strong>Thar:</strong> {userData.thar}</p>
          <p><strong>Region:</strong> {userData.region}</p>
          <p><strong>Skills:</strong> {userData.skills}</p>
          <p><strong>Phone:</strong> {userData.phone}</p>
          <p><strong>Karma:</strong> {userData.karma}</p>
          <button onClick={() => setEditMode(true)} className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">Edit Profile</button>
        </div>
      )}
    </div>
  );
}
