import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import withAuth from '../components/withAuth';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const guthiKey = localStorage.getItem('guthiKey');
      if (!guthiKey) return;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('guthiKey', guthiKey)
        .single();
      if (data) {
        setUserData(data);
        setForm(data);
      } else {
        console.error('❌ Fetch error:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const guthiKey = localStorage.getItem('guthiKey');
    const { error } = await supabase
      .from('users')
      .update(form)
      .eq('guthiKey', guthiKey);
    if (!error) {
      localStorage.setItem('userName', form.name);
      setMessage('✅ Profile updated');
      setUserData(form);
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } else {
      console.error('❌ Update failed:', error);
      setMessage('❌ Update failed');
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>🌙 Summoning your Guthi Circle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white p-6">
      <div className="max-w-md mx-auto border border-green-500 rounded p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-center text-pink-400 mb-4">
          🌸 Welcome, {userData.name}
        </h1>

        {isEditing ? (
          <>
            <input className="w-full p-2 mb-2 rounded text-black" name="name" value={form.name} onChange={handleChange} />
            <input className="w-full p-2 mb-2 rounded text-black" name="thar" value={form.thar} onChange={handleChange} />
            <input className="w-full p-2 mb-2 rounded text-black" name="region" value={form.region} onChange={handleChange} />
            <input className="w-full p-2 mb-2 rounded text-black" name="skills" value={form.skills} onChange={handleChange} />
            <input className="w-full p-2 mb-2 rounded text-black" name="phone" value={form.phone} onChange={handleChange} />
            <button onClick={handleSave} className="w-full bg-green-600 text-white py-2 rounded">
              💾 Save Changes
            </button>
          </>
        ) : (
          <>
            <p><strong>Thar:</strong> <span className="text-green-400">{userData.thar}</span></p>
            <p><strong>Region:</strong> <span className="text-green-400">{userData.region}</span></p>
            <p><strong>Skills:</strong> {userData.skills}</p>
            <p><strong>Phone:</strong> {userData.phone}</p>
            <p><strong>Karma:</strong> {userData.karma}</p>

            <button
  onClick={() => router.push('/edit-profile')}
  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
>
  ✏️ Edit Profile
</button>
            <div className="mt-4 text-center">
              <a href="/grove/ritual" className="text-green-400 underline">🌿 Visit Ritual Garden</a>
            </div>
          </>
        )}

        {message && (
          <p className="mt-4 text-yellow-300 text-center font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
