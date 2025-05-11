
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import withAuth from '../components/withAuth';
import { useRouter } from 'next/router';

function ReflectPage() {
  const [message, setMessage] = useState('');
  const [mood, setMood] = useState('🙂');
  const [info, setInfo] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    const guthiKey = localStorage.getItem('guthiKey');
    if (!guthiKey || !message.trim()) return;

    const { error } = await supabase.from('reflections').insert([{
      guthiKey,
      message: message.trim(),
      mood
    }]);

    if (!error) {
      setInfo('✅ Reflection saved.');
      setMessage('');
      setTimeout(() => router.push('/timeline'), 1000);
    } else {
      setInfo('❌ Failed to save.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6">
      <h1 className="text-xl font-bold mb-4">📝 Reflect Today</h1>
      <textarea
        rows="5"
        className="w-full max-w-md border p-3 rounded mb-3"
        placeholder="What is whispering within you today?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <select value={mood} onChange={(e) => setMood(e.target.value)} className="mb-4 p-2 border rounded">
        <option>🙂</option>
        <option>😌</option>
        <option>😔</option>
        <option>😠</option>
        <option>🤯</option>
        <option>❤️</option>
      </select>
      <button onClick={handleSubmit} className="bg-green-600 text-white px-6 py-2 rounded font-semibold">
        🌿 Submit Reflection
      </button>
      {info && <p className="mt-4 text-sm">{info}</p>}
    </div>
  );
}

export default withAuth(ReflectPage);
