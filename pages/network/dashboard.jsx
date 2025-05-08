import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

export default function GuthiDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUid = localStorage.getItem('guthiUid');
      if (!storedUid) {
        router.push('/network/welcome');
        return;
      }
      const docSnap = await getDoc(doc(db, 'users', storedUid));
      if (docSnap.exists()) setUserData(docSnap.data());
      else router.push('/network/welcome');
    };
    fetchUserData();
  }, []);

  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 text-xl">🌸 Loading your Guthi Circle...</p>
      </div>
    );
  }

  const Card = ({ label, value, icon }) => (
    <div className="bg-white shadow-lg rounded-xl p-5 w-full md:w-[48%] lg:w-[30%] text-center">
      <p className="text-3xl mb-2">{icon}</p>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-bold text-xl text-purple-700">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100 px-6 py-10">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-purple-700 mb-2">🌿 Welcome, {userData.name.split(' ')[0]}</h1>
        <p className="text-lg text-gray-600">Your presence has been recorded in the sacred Guthi Circle.</p>
      </motion.div>

      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <Card label="Thar" value={userData.thar} icon="🌀" />
        <Card label="Guthi Role" value={userData.guthiRoles || '—'} icon="🛕" />
        <Card label="Phone" value={userData.phone} icon="📞" />
        <Card label="Town" value={userData.town || userData.address || '—'} icon="🌆" />
        <Card label="Languages" value={userData.languages || '—'} icon="🗣️" />
        <Card label="Skills" value={userData.skills || '—'} icon="🎁" />
        <Card label="Presence" value={userData.presence || 'new'} icon="🧘" />
        <Card label="Karma Points" value="0" icon="🌟" />
      </div>

      {userData.photoURL && (
        <div className="mt-10 flex justify-center">
          <img
            src={userData.photoURL}
            alt="User Photo"
            className="w-40 h-40 rounded-full shadow-md border-4 border-purple-500"
          />
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          onClick={() => router.push('/')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full text-lg"
        >
          🏠 Go to Main Portal
        </button>
      </div>
    </div>
  );
}
