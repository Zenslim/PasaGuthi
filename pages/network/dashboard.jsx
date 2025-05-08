import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

export default function GuthiDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem('guthiUid');
    if (!uid) return router.push('/network/welcome');
    // Simulated user data fetch
    setUserData({ name: 'Newar Seeker', email: 'user@example.com', karma: 42 });
  }, []);

  return (
    <div className="min-h-screen bg-white p-4">
      {userData ? (
        <>
          <h1 className="text-2xl font-bold">{userData.name}</h1>
          <p>{userData.email}</p>
          <p>Karma: {userData.karma}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
