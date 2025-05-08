import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/signin');
      }
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">🙏 Welcome to PasaGuthi</h1>
      <p>Let’s complete your onboarding to join the Guthi circle.</p>
    </div>
  );
}