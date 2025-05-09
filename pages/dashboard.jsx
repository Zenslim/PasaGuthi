import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function GuthiDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUid = localStorage.getItem('guthiUid');
      if (!storedUid) {
        router.push('/welcome');
        return;
      }
      const { data, error } = await supabase.from('users').select('*').eq('uid', storedUid).single();
      if (error || !data) {
        router.push('/welcome');
      } else {
        setUserData(data);
      }
    };
    fetchUserData();
  }, []);

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">🌙 Loading your Guthi Circle...</p>
      </div>
    );
  }

  const role = userData.guthiRoles?.toLowerCase();
  const isAdmin = role?.includes('admin');
  const isElder = role?.includes('elder');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 1.2 }}
      className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-6"
    >
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">🔱 Pasaguthi Dashboard</h1>
        <p className="text-lg text-purple-300">Welcome, {userData.name} of {userData.thar}</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </section>

      <section className="mt-10">
        <h2 className="text-2xl mb-4 font-semibold text-center">🚀 Start Contributing</h2>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl text-white font-bold shadow-md">🌙 Whisper Now</button>
          <button className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl text-white font-bold shadow-md">🧭 Join a Circle</button>
          <button className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-xl text-white font-bold shadow-md">🗳 Propose a Vow</button>
        </div>

        {isAdmin && (
          <div className="mt-10 bg-yellow-900/40 p-4 rounded-xl text-yellow-300">
            <h3 className="text-lg font-bold mb-2">🛡 Admin Console</h3>
            <p>Access proposals, manage members, and publish DAO votes.</p>
          </div>
        )}

        {isElder && (
          <div className="mt-6 bg-blue-900/40 p-4 rounded-xl text-blue-300">
            <h3 className="text-lg font-bold mb-2">🕊 Elder Reflections</h3>
            <p>You are invited to guide the younger generation through whispers and blessings.</p>
          </div>
        )}
      </section>

      <footer className="mt-16 text-center text-sm text-gray-500">
        Guthi = DAO + Dharma • Pasaguthi.org
      </footer>
    </motion.div>
  );
}
