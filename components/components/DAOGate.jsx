
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function DAOGate() {
  const [karma, setKarma] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const guthiKey = localStorage.getItem('guthiKey');
    if (!guthiKey) return;

    const fetchKarma = async () => {
      const { data } = await supabase
        .from('users')
        .select('karma')
        .eq('guthiKey', guthiKey)
        .single();

      if (data?.karma >= 13) {
        setUnlocked(true);
        setKarma(data.karma);
      } else {
        setKarma(data?.karma || 0);
      }
    };

    fetchKarma();
  }, []);

  return (
    <div className="bg-black text-white border border-yellow-600 rounded p-6 text-center">
      <h2 className="text-xl font-bold text-yellow-400 mb-2">🕸 DAO Activation Gate</h2>
      {unlocked ? (
        <p className="text-green-400">✅ You have {karma} karma. The circle welcomes you. <a href="/proposals" className="underline text-pink-300">Enter DAO</a></p>
      ) : (
        <p className="text-gray-400">You need 13+ karma to unlock DAO access. You currently have {karma}.</p>
      )}
    </div>
  );
}
