
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function EchoArchive({ userId }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchReflections = async () => {
      const { data, error } = await supabase
        .from('reflections')
        .select('text, created_at')
        .eq('userId', userId)
        .order('created_at', { ascending: false });
      if (data) setEntries(data);
    };

    fetchReflections();
  }, [userId]);

  return (
    <div className="bg-slate-800 border border-slate-600 rounded p-4 text-white">
      <h2 className="text-lg font-semibold text-yellow-300 mb-2">📜 Your Echo Archive</h2>
      {entries.length === 0 ? (
        <p className="text-gray-400">You haven't whispered yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {entries.map((entry, idx) => (
            <li key={idx} className="border-b border-slate-700 pb-2">
              <p className="text-green-300 italic">“{entry.text}”</p>
              <p className="text-gray-500">{new Date(entry.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
