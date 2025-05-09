import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const sporeId = localStorage.getItem('sporeId');
      if (!sporeId) {
        console.warn("No sporeId found in localStorage.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('sporeId', sporeId);

      if (error) {
        console.error('❌ Supabase fetch error:', error);
      } else {
        setUserData(data?.[0] || null);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

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
      <p><strong>Thar:</strong> {userData.thar}</p>
      <p><strong>Region:</strong> {userData.region}</p>
      <p><strong>Skills:</strong> {userData.skills}</p>
      <p><strong>Phone:</strong> {userData.phone}</p>
      <p><strong>Karma:</strong> {userData.karma}</p>
    </div>
  );
}
