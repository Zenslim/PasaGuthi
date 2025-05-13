import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import PublicProfileCard from '../components/PublicProfileCard';

export default function YellowPages() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('users')
        .select('name, thar, photo, region')
        .order('name');

      if (data) setProfiles(data);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-10">🧑‍🤝‍🧑 Yellow Pages</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {profiles.map((profile) => (
          <PublicProfileCard key={profile.name + profile.thar} {...profile} />
        ))}
      </div>
    </div>
  );
}
