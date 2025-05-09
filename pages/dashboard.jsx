import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

export default function GuthiDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (typeof window === 'undefined') return;

      const storedUid = localStorage.getItem('guthiUid');
      if (!storedUid) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('users').select('*').eq('uid', storedUid).single();
      if (data) setUserData(data);
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">🌙 Summoning your Guthi Circle...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 1.2 }}
      className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-6"
    >
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">🔱 Pasaguthi Dashboard</h1>
        {userData ? (
          <p className="text-lg text-purple-300">Welcome, {userData.name} of {userData.thar}</p>
        ) : (
          <p className="text-lg text-gray-400">No user data loaded. Please sign in.</p>
        )}
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userData && (
          <>
            <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
              <h2 className="text-xl font-semibold mb-2">🧬 Lineage</h2>
              <p><strong>Thar:</strong> {userData.thar}</p>
              <p><strong>Region:</strong> {userData.region || 'N/A'}</p>
              <p><strong>Gender:</strong> {userData.gender}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
              <h2 className="text-xl font-semibold mb-2">🌿 Karma</h2>
              <p><strong>Karma Points:</strong> {userData.karma || 0}</p>
              <p><strong>Reflections:</strong> {userData.reflections?.length || 0}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
              <h2 className="text-xl font-semibold mb-2">💠 Identity</h2>
              <p><strong>Skills:</strong> {userData.skills || 'Not listed'}</p>
              <p><strong>Roles:</strong> {userData.guthiRoles || 'None yet'}</p>
              <p><strong>Languages:</strong> {userData.languages || 'N/A'}</p>
            </div>
          </>
        )}
      </section>

      <section className="mt-10 text-center">
        <h2 className="text-2xl mb-4 font-semibold">🚀 Sacred Actions</h2>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl text-white font-bold shadow-md">🌙 Whisper</button>
          <button className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl text-white font-bold shadow-md">🧭 Join Circle</button>
          <button className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-xl text-white font-bold shadow-md">🗳 Propose Vow</button>
        </div>
      </section>

      <footer className="mt-16 text-center text-sm text-gray-500">
        Guthi = DAO + Dharma • Pasaguthi.org
      </footer>
    </motion.div>
  );
}
