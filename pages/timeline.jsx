
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculateReflectionDepth } from '../lib/calculateReflectionDepth';
import styles from '../styles/depthAura.module.css';

export default function Timeline() {
  const [reflections, setReflections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const guthiKey = localStorage.getItem('guthiKey');
      if (!guthiKey) return;

      const { data } = await supabase
        .from('reflections')
        .select('text, created_at')
        .eq('userId', guthiKey)
        .order('created_at', { ascending: true });

      if (data) {
        const enriched = data.map(item => ({
          ...item,
          depth: calculateReflectionDepth(item.text)
        }));
        setReflections(enriched);
      }
    };

    fetchData();
  }, []);

  const getDepthStyle = (depth) => {
    switch (depth) {
      case '🪶 Very Light':
        return styles.veryLight;
      case '🌿 Light':
        return styles.light;
      case '🔥 Deep':
        return styles.deep;
      case '🌌 Very Deep':
        return styles.veryDeep;
      default:
        return styles.light;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl text-center font-bold text-yellow-300 mb-8">📜 Your Living Timeline</h1>
      {reflections.length === 0 ? (
        <p className="text-center text-gray-500">No whispers yet... the circle is waiting.</p>
      ) : (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          {reflections.map((entry, index) => (
            <div key={index} className="relative p-4 border-l-4 border-indigo-500 pl-6">
              <div className="absolute left-0 top-4">
                <div className={\`\${styles.auraRing} \${getDepthStyle(entry.depth)}\`} />
              </div>
              <p className="text-sm text-gray-400">{new Date(entry.created_at).toLocaleString()}</p>
              <p className="text-green-300 italic">“{entry.text.slice(0, 100)}{entry.text.length > 100 ? '…' : ''}”</p>
              <p className="text-blue-400 text-sm mt-1">Depth: {entry.depth}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
