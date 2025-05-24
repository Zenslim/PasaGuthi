<Head>
        <title>Offer Gratitude — Karma in Pasaguthi</title>
        <meta name="description" content="Contribute energy to the Guthi. Offering karma means offering attention, presence, and gratitude to the community." />
        <meta property="og:title" content="Offer Gratitude — Karma in Pasaguthi" />
        <meta property="og:description" content="Contribute energy to the Guthi. Offering karma means offering attention, presence, and gratitude to the community." />
        <meta property="og:url" content="https://www.pasaguthi.org/karma" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={ __html: JSON.stringify({'@context': 'https://schema.org', '@type': 'WebPage', 'name': 'Karma in Pasaguthi', 'url': 'https://www.pasaguthi.org/karma', 'description': 'Participate in the cooperative circle by offering karma. Pasaguthi honors every act of gratitude and service.'}) } />
    </Head>

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import withAuth from '../components/withAuth';

function KarmaBoost() {
  const [karma, setKarma] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchKarma = async () => {
    const guthiKey = localStorage.getItem('guthiKey');
    const { data } = await supabase
      .from('users')
      .select('karma')
      .eq('guthiKey', guthiKey)
      .limit(1);
    if (data && data.length > 0) setKarma(data[0].karma || 0);
  };

  useEffect(() => {
    fetchKarma();
  }, []);

  const incrementKarma = async () => {
    setLoading(true);
    const guthiKey = localStorage.getItem('guthiKey');
    const { error } = await supabase.rpc('increment_karma', { user_key: guthiKey });
    if (!error) {
      setMessage('🪷 Gratitude offered. Karma +1');
      fetchKarma();
    } else {
      setMessage('❌ Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-black bg-white px-4 py-10">
      <h1 className="text-xl font-bold mb-4">🌿 Offer Gratitude</h1>
      <p className="mb-4">Current Karma: <strong>{karma !== null ? karma : '...'}</strong></p>
      <button
        onClick={incrementKarma}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
      >
        {loading ? '🙏 Offering...' : '🪷 Offer Gratitude'}
      </button>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}

export default withAuth(KarmaBoost);
