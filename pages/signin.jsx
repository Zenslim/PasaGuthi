import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function SignInPage() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    setError('');
    const { data, error } = await supabase.from('users').select('*').eq('uid', key).single();
    if (error || !data) {
      setError('Invalid Guthi Key. Please check and try again.');
      return;
    }
    localStorage.setItem('guthiUid', key);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">🔑 Enter Your Guthi Key</h1>
        <input
          type="text"
          placeholder="e.g. gh-8421a7f1"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full p-3 mb-4 text-black rounded-lg"
        />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          onClick={handleSignIn}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg"
        >
          ✨ Unlock My Dashboard
        </button>
      </div>
    </div>
  );
}
