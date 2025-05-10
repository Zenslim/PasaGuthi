
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';

export default function SignInPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    setError('');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone.trim())
      .single();

    if (error || !data) {
      setError('No user found with that phone number.');
      return;
    }

    const passwordMatch = await bcrypt.compare(password, data.password);
    if (!passwordMatch) {
      setError('Incorrect password.');
      return;
    }

    localStorage.setItem('guthiKey', data.guthiKey);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 p-6 rounded-xl shadow-lg">
<h1 className="text-2xl font-bold text-center mb-4">🔑 Login to Your Guthi</h1>
      <input className="w-full p-3 mb-4 text-black rounded-lg"
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input className="w-full p-3 mb-4 text-black rounded-lg"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p>{error}</p>}
      <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg" onClick={handleSignIn}>✨ Unlock My Dashboard</button>
    </div>
</div>
);
}

