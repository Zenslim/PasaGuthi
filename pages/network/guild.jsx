import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Guild() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error) setProfiles(data);
    };
    loadProfiles();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">🛡️ Guthi Members</h1>
      <ul>
        {profiles.map(profile => (
          <li key={profile.id}>{profile.full_name}</li>
        ))}
      </ul>
    </div>
  );
}