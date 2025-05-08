
import { useEffect, useState } from "react";
import { supabase } from '../lib/supabaseClient';
import UnifiedProfileCard from "../../components/UnifiedProfileCard";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Guild() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const snapshot = await getDocs(collection(db, "profiles"));
      const all = snapshot.docs.map(doc => doc.data());
      setProfiles(all);
    };
    fetchProfiles();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
        <h1 className="text-4xl font-bold text-center text-purple-900 mb-4">🌐 The Living Guthi</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Discover Newars who are rekindling our ancestral vows across the world.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile, i) => (
            <UnifiedProfileCard key={i} profile={profile} currentUser={user} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
