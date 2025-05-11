import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import withAuth from '../../components/withAuth';

function GuthiCircle() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [circle, setCircle] = useState([]);
  const [guthiKey, setGuthiKey] = useState('');

  useEffect(() => {
    const key = localStorage.getItem('guthiKey');
    if (!key) return;
    setGuthiKey(key);

    const fetchUser = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('guthiKey', key)
        .single();
      if (data) setUserData(data);
    };

    const fetchCircle = async () => {
      const { data } = await supabase
        .from('users')
        .select('name, karma, thar, region, guthiKey')
        .order('karma', { ascending: false });
      if (data) setCircle(data);
    };

    fetchUser();
    fetchCircle();
  }, []);

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>🌘 Connecting to your sacred Guthi Circle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white p-8">
      <div className="max-w-3xl mx-auto border border-yellow-500 rounded-xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-center text-yellow-300 mb-6">
          🕸 Your Guthi Circle
        </h1>

        <p className="text-lg text-center mb-4">
          🌿 Namaste, <span className="text-green-400">{userData.name}</span>. You stand among your kin.
        </p>

        <h2 className="text-xl text-pink-300 font-semibold mt-6 mb-3 text-center">✨ Karma Leaderboard</h2>
        <ul className="space-y-2 text-sm">
          {circle.map((member, i) => (
            <li
              key={member.guthiKey}
              className={`p-3 rounded-md border ${
                member.guthiKey === guthiKey
                  ? 'border-pink-400 bg-pink-950'
                  : 'border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  {member.guthiKey === guthiKey ? '💠 ' : ''}
                  <span className="text-green-300 font-bold">{member.name}</span>{' '}
                  <span className="text-gray-400">({member.thar}, {member.region})</span>
                </div>
                <span className="text-yellow-300 font-mono">+{member.karma} karma</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <p className="italic text-gray-400">
            “Each good action echoes through your Guthi Circle.”
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(GuthiCircle);
