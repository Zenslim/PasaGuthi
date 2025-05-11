import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function ProfileForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "", thar: "", title: "", region: "", photo_url: "", bio: "",
    skills: "", guthi_roles: "", language: "", diaspora_node: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = await supabase.auth.getUser();
    const uid = user?.data?.user?.id;

    if (!uid) return alert("Not authenticated");

    const profile = {
      ...formData,
      id: uid,
      skills: formData.skills.split(',').map(s => s.trim()),
      guthi_roles: formData.guthi_roles.split(',').map(s => s.trim()),
      language: formData.language.split(',').map(s => s.trim()),
      profile_completed: true,
    };

    const { error } = await supabase
      .from('users')
      .upsert(profile, { onConflict: 'id' });

    if (error) {
      console.error(error);
      return alert("Error saving profile");
    }

    router.push("/network/guthyars");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">🌱 Complete Your Guthi Profile</h2>

      {["name", "thar", "title", "region", "photo_url", "bio", "skills", "guthi_roles", "language"].map(field => (
        <input
          key={field}
          name={field}
          value={formData[field]}
          onChange={handleChange}
          placeholder={field.replace("_", " ").toUpperCase()}
          className="block w-full border p-2 mb-2"
          required={["name", "thar"].includes(field)}
        />
      ))}

      <label className="block text-sm mt-2">
        <input type="checkbox" name="diaspora_node" checked={formData.diaspora_node} onChange={handleChange} className="mr-2" />
        🌏 I am part of the diaspora
      </label>

      <button type="submit" className="mt-4 bg-purple-600 text-white px-4 py-2 rounded">Save & Join</button>
    </form>
  );
}
