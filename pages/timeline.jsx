
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import withAuth from '../components/withAuth';

function TimelinePage() {
  const [reflections, setReflections] = useState([]);

  useEffect(() => {
    const load = async () => {
      const guthiKey = localStorage.getItem('guthiKey');
      const { data } = await supabase
        .from('reflections')
        .select('*')
        .eq('guthiKey', guthiKey)
        .order('createdAt', { ascending: false });
      setReflections(data || []);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-xl font-bold mb-6">🕰️ Your Reflection Timeline</h1>
      <div className="space-y-4 max-w-2xl mx-auto">
        {reflections.map((r) => (
          <div key={r.id} className="border rounded p-4 shadow">
            <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</div>
            <div className="text-lg mt-1">{r.message}</div>
            {r.mood && <div className="text-xl mt-2">{r.mood}</div>}
          </div>
        ))}
        {reflections.length === 0 && <p className="text-center text-gray-500">No reflections yet.</p>}
      </div>
    </div>
  );
}

export default withAuth(TimelinePage);
