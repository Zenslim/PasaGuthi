import { useEffect, useState } from 'react';
import GardenGrid from '../../components/GardenGrid';
import { supabase } from '../../lib/supabaseClient';

export default function RitualGrove() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-lg">
        🌿 Gathering the Guthi Grove...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 text-gray-800">
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold text-green-900">🌳 Ritual Garden</h1>
        <p className="text-sm text-gray-600">Each soul is a living plant. Tap to listen or honor.</p>
      </header>

      <GardenGrid users={users} onPlantClick={setSelected} />

      {selected && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-lg p-4 rounded-xl shadow-xl border text-center z-20">
          <p className="font-bold text-green-800">{selected.name}</p>
          <p className="text-sm text-gray-700">Thar: {selected.thar}</p>
          <p className="text-sm">Karma: {selected.karma}</p>
          <p className="text-xs mt-2 text-gray-500 italic">Whispers coming soon...</p>
          <button
            onClick={() => setSelected(null)}
            className="mt-3 text-xs text-red-500 underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
