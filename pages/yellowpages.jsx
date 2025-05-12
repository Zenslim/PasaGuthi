import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import PublicProfileCard from '../components/PublicProfileCard';

export default function YellowPages() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    async function fetchPublicProfiles() {
      const { data, error } = await supabase
        .from('users')
        .select('name, thar, photo, region')
        .order('name');
      if (!error) setProfiles(data);
    }
    fetchPublicProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
        📖 Yellow Pages — Public Guthyars
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
        {profiles.map((profile) => (
          <PublicProfileCard key={profile.name + profile.thar} {...profile} />
        ))}
      </div>
    </div>
  );
}
