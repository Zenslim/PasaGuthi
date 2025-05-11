
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import withAuth from '../components/withAuth';
import EchoArchive from '../components/EchoArchive';
import DAOGate from '../components/DAOGate';

function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const guthiKey = localStorage.getItem('guthiKey');
      if (!guthiKey) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('guthiKey', guthiKey)
        .single();

      if (data) setUserData(data);
    };

    fetchData();
  }, []);

  const NavButton = ({ label, href, locked, emoji }) => (
    <button
      onClick={() => !locked && router.push(href)}
      className={`w-full py-2 px-4 rounded text-white transition ${
        locked
          ? 'bg-gray-600 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700'
      }`}
    >
      {emoji} {label} {locked ? '🔒' : ''}
    </button>
  );

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>🌿 Loading your Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white p-6">
      <div className="max-w-2xl mx-auto border border-purple-500 rounded-xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-center text-yellow-300 mb-4">
          🌸 Welcome, {userData.name}
        </h1>

        <div className="text-center mb-6 space-y-1">
          <p>🪶 Thar: <span className="text-green-300">{userData.thar}</span></p>
          <p>📍 Region: <span className="text-blue-300">{userData.region}</span></p>
          <p>📱 Phone: <span className="text-orange-300">{userData.phone}</span></p>
          <p>🛠 Skills: <span className="text-purple-300">{userData.skills}</span></p>
          <p>✨ Karma: <span className="text-pink-300 font-mono">{userData.karma}</span></p>
        </div>

        <div className="grid gap-3 mb-6">
          <NavButton emoji="🔙" label="Back to Profile" href="/edit-profile" />
          <NavButton emoji="🌌" label="Guthi Echoes" href="/network/echoes" />
          <NavButton emoji="📜" label="My Timeline" href="/timeline" />
          <NavButton emoji="🧘" label="Reflect Again" href="/reflect" />
          <NavButton emoji="🕸" label="Enter Guthi Circle" href="/network/circle" />
          <NavButton emoji="🌿" label="Visit Ritual Garden" href="/grove/ritual" />
        </div>

        <EchoArchive userId={userData.guthiKey} />
        <div className="mt-6">
          <DAOGate />
        </div>

        <div className="mt-6 text-center text-sm italic text-gray-400">
          “Your path unfolds as you whisper, act, and listen.”
        </div>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
