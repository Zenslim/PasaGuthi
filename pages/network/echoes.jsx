
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { generateEchoReply } from '../../lib/echoSpiritEngineDeepseek';

export default function Echoes() {
  const [whispers, setWhispers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newWhisper, setNewWhisper] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWhispers = async () => {
      const { data, error } = await supabase
        .from('reflections')
        .select('text, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setWhispers(data);
    };

    fetchWhispers();

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % whispers.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [whispers.length]);

  const handleSubmit = async () => {
    if (!newWhisper.trim()) return;
    setLoading(true);

    const userId = localStorage.getItem('guthiKey') || 'anonymous';
    const planet = 'Saturn'; // Future: randomize or tie to karma
    const { error } = await supabase
      .from('reflections')
      .insert([{ text: newWhisper, userId }]);

    const echo = await generateEchoReply({ text: newWhisper, userId, planet });
    setResponse(echo.reply);
    setNewWhisper('');
    setLoading(false);

    // Optional: increment karma
    await supabase.rpc('increment_karma', { guthikey: userId });
  };

  const currentWhisper = whispers[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold text-yellow-400">🌌 Guthi Echoes</h1>
        {currentWhisper ? (
          <div className="p-4 border border-yellow-600 rounded-lg bg-slate-800">
            <p className="text-xl italic text-green-300">“{currentWhisper.text}”</p>
            <p className="text-sm text-gray-400 mt-2">— A whisper from the circle</p>
          </div>
        ) : (
          <p className="text-gray-500">Listening for whispers...</p>
        )}

        <div className="pt-6">
          <textarea
            rows="3"
            className="w-full p-3 rounded text-black"
            placeholder="🌿 Leave your whisper..."
            value={newWhisper}
            onChange={(e) => setNewWhisper(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Whisper to the Circle'}
          </button>
        </div>

        {response && (
          <div className="mt-6 p-4 border border-pink-500 rounded bg-pink-950 text-left">
            <p className="text-pink-300 font-semibold">🌬 The Guthi whispers back:</p>
            <p className="mt-2 text-white">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
