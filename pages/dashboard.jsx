import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import withAuth from '../components/withAuth';

function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

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
        console.error('Fetch error:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const guthiKey = localStorage.getItem('guthiKey');

    const { error } = await supabase
      .from('users')
      .update(form)
      .eq('guthiKey', guthiKey);

    if (!error) {
      setMessage('✅ Your Guthi profile has been honored.');
      localStorage.setItem('userName', form.name);
      setUserData(form);
      setIsEditing(false);
    } else {
      setMessage('❌ Something went wrong. The forest whispers confusion.');
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
      <div className="max-w-2xl mx-auto border border-green-500 rounded p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-pink-400 mb-4">
          🌸 Welcome, {userData.name}
        </h1>

        {isEditing ? (
          <div className="grid gap-3">
            {['name', 'thar', 'region', 'skills', 'phone'].map((field) => (
              <input
                key={field}
                className="w-full p-2 rounded text-black"
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field] || ''}
                onChange={handleChange}
              />
            ))}
            <button
              onClick={handleSave}
              className="bg-green-600 text-white py-2 rounded w-full"
            >
              💾 Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-lg">
            <p><strong>🪶 Thar:</strong> <span className="text-green-400">{userData.thar}</span></p>
            <p><strong>📍 Region:</strong> <span className="text-green-400">{userData.region}</span></p>
            <p><strong>📱 Phone:</strong> <span className="text-green-400">{userData.phone}</span></p>
            <p><strong>🛠 Skills:</strong> {userData.skills}</p>
            <p><strong>🧘 Karma Points:</strong> {userData.karma}</p>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              ✏️ Edit Profile
            </button>

            <div className="mt-6 space-y-2 text-center">
              <a href="/grove/ritual" className="text-green-400 underline">
                🌿 Step into the Ritual Grove
              </a>
              <br />
              <a href="/network/circle" className="text-purple-400 underline">
                🌀 Enter the Guthi Circle
              </a>
            </div>
          </div>
        )}

        {message && (
          <p className="mt-4 text-center text-sm text-yellow-300">{message}</p>
        )}
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
