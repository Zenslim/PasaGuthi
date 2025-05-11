import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import withAuth from '../../components/withAuth';

function GuthiCircle() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const guthiKey = localStorage.getItem('guthiKey');
    if (!guthiKey) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('guthiKey', guthiKey)
        .single();

      if (data) setUserData(data);
      else console.warn('Guthi data not found');
    };

    fetchData();
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
          🌿 Namaste, <span className="text-green-400">{userData.name}</span>. You stand within the circle of ancestors and dreamers. 
        </p>

        <ul className="text-center text-sm space-y-2">
          <li>🪶 Thar: <span className="text-green-300">{userData.thar}</span></li>
          <li>🌍 Region: <span className="text-blue-300">{userData.region}</span></li>
          <li>🔧 Skills: <span className="text-purple-300">{userData.skills}</span></li>
          <li>📞 Phone: <span className="text-orange-300">{userData.phone}</span></li>
          <li>✨ Karma: <span className="text-pink-300">{userData.karma}</span></li>
        </ul>

        <div className="mt-8 text-center">
          <p className="italic text-gray-400">
            “You are not alone. Each whisper, each gift, and each action in this circle shapes the future of our people.”
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(GuthiCircle);
