// pages/network/guthyars.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProfileCard from '../../components/ProfileCard';

export default function Guthyars() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [diasporaOnly, setDiasporaOnly] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, title, region, photo_url, bio, skills, diaspora_node');

      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      setProfiles(data);

      // Derive unique regions
      const regionSet = new Set(data.map((p) => p.region).filter(Boolean));
      setRegions([...regionSet].sort());
    };

    fetchProfiles();
  }, []);

  const filtered = profiles.filter((p) => {
    const matchSearch =
      (
        (p.name || '') +
        (p.title || '') +
        (p.region || '') +
        (p.skills || []).join(',')
      ).toLowerCase().includes(search.toLowerCase());

    const matchRegion = regionFilter ? p.region === regionFilter : true;
    const matchDiaspora = diasporaOnly ? p.diaspora_node === true : true;

    return matchSearch && matchRegion && matchDiaspora;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
        <h1 className="text-4xl font-bold text-center text-purple-900 mb-4">📖 Guthyars — Newar Yellow Pages</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          A living registry of sacred roots — every Newar who stepped forward into the Guthi field.
        </p>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <input
            type="text"
            placeholder="Search name, skill, or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">🌍 All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={diasporaOnly}
              onChange={() => setDiasporaOnly(!diasporaOnly)}
              className="h-5 w-5 text-purple-600"
            />
            <span className="text-sm text-gray-700">🌎 Diaspora Only</span>
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-32">
          {filtered.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
