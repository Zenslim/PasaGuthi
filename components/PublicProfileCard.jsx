// components/PublicProfileCard.jsx
export default function PublicProfileCard({ name, thar, photo, region }) {
  return (
    <div className="p-4 border rounded-xl shadow bg-white dark:bg-gray-900 text-center w-full max-w-xs">
      <img
        src={photo || "/default-avatar.png"}
        alt={name}
        className="w-24 h-24 rounded-full mx-auto object-cover"
      />
      <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{thar}</p>
      <p className="text-xs text-gray-400 dark:text-gray-400 italic mt-1">{region}</p>
    </div>
  );
} 


// pages/guthyars.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import PublicProfileCard from '../components/PublicProfileCard';

export default function Guthyars() {
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
