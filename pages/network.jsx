import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';
import ProfileEditor from '../components/ProfileEditor';

export default function Network() {
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pasaguthi_profiles');
    if (stored) {
      setProfiles(JSON.parse(stored));
    } else {
      // Seed 3 profiles
      setProfiles([
        {
          name: "Sajana Shrestha",
          title: "Architect",
          region: "Kathmandu",
          photo_url: "https://i.imgur.com/Qs9eJ5Y.png",
          bio: "I draw temples into rebirth.",
          skills: ["Design", "Heritage Mapping"],
          diaspora_node: false
        },
        {
          name: "Dipak Maharjan",
          title: "Woodcarver",
          region: "Bhaktapur",
          photo_url: "https://i.imgur.com/ZQZL7rE.png",
          bio: "Every cut carries ancestral memory.",
          skills: ["CNC", "Iconography"],
          diaspora_node: false
        },
        {
          name: "Tara Tuladhar",
          title: "Diaspora Organizer",
          region: "New York City",
          photo_url: "https://i.imgur.com/8KhE47B.png",
          bio: "I connect the scattered souls.",
          skills: ["Fundraising", "Cultural Strategy"],
          diaspora_node: true
        }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pasaguthi_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const filtered = profiles.filter((p) =>
    (p.name + p.title + p.region + p.skills.join(","))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSave = (profile) => {
    if (editingIndex !== null) {
      const updated = [...profiles];
      updated[editingIndex] = profile;
      setProfiles(updated);
    } else {
      setProfiles([...profiles, profile]);
    }
    setEditorOpen(false);
    setEditingIndex(null);
  };

  const handleDelete = (index) => {
    if (confirm("Delete this profile?")) {
      const updated = profiles.filter((_, i) => i !== index);
      setProfiles(updated);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
        <h1 className="text-4xl font-bold text-center text-purple-900 mb-4">🌐 Newar Professional Guild</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          What if 1 million Newars didn’t just connect, but remembered, honored, and rebuilt the sacred network of skill and soul?
        </p>

        <div className="max-w-xl mx-auto mb-10">
          <input
            type="text"
            placeholder="Search name, skill, or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-32">
          {filtered.map((profile, index) => (
            <ProfileCard
              key={index}
              profile={profile}
              onEdit={() => {
                setEditingIndex(index);
                setEditorOpen(true);
              }}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </div>

        <button
          onClick={() => {
            setEditingIndex(null);
            setEditorOpen(true);
          }}
          className="fixed bottom-8 right-8 bg-purple-700 text-white px-6 py-3 rounded-full shadow-lg text-lg hover:bg-purple-800 transition"
        >
          ＋ Add Profile
        </button>

        {editorOpen && (
          <ProfileEditor
            existing={editingIndex !== null ? profiles[editingIndex] : null}
            onSave={handleSave}
            onClose={() => {
              setEditorOpen(false);
              setEditingIndex(null);
            }}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
