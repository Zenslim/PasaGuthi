import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function GuthiDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/signin');
      } else {
        setUser(data.session.user);
      }
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">🌿 Guthi Dashboard</h1>
      {user ? <p>Welcome, {user.email}</p> : <p>Loading...</p>}
    </div>
  );
}