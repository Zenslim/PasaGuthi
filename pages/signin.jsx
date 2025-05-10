import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';

export default function SignIn() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isPhone = identifier.startsWith('+');
    const key = isPhone ? 'phone' : 'guthiKey';

    const { data, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq(key, identifier.trim())
      .limit(1)
      .single();

    if (fetchError || !data) {
      setError('❌ User not found. Please check your Guthi Key or phone.');
      return;
    }

    const match = await bcrypt.compare(password, data.password || '');
    if (!match) {
      setError('❌ Incorrect password.');
      return;
    }

    localStorage.setItem('guthiKey', data.guthiKey);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        <h1 className="text-2xl font-bold text-center">🔐 Enter Your Guthi</h1>
        <p className="text-sm text-center text-gray-600">
          Use your <strong>Guthi Key</strong> or <strong>Phone</strong> and <strong>Password</strong> to enter the circle.
        </p>

        <div>
          <label className="block font-semibold">🧾 Guthi Key or Phone</label>
          <input
            type="text"
            required
            placeholder="e.g., maya-shrestha-bhaktapur-42UH5 or +97798XXXXXXX"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">🔐 Password</label>
          <input
            type="password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-800"
        >
          🌀 Enter My Guthi Dashboard
        </button>
      </form>
    </div>
  );
}
