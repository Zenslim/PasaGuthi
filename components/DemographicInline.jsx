
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function DemographicInline({ guthiKey }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    bio: "",
    language: "",
    dob: "",
    education_level: "",
    employment_status: "",
    marital_status: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const profile = {
      ...formData,
      guthiKey,
      photo_url: null,
      language: formData.language.split(',').map(s => s.trim()),
      profile_completed: true,
    };

    const { error } = await supabase.from('users').update(profile).eq('guthiKey', guthiKey);
    if (error) return alert("Error saving profile.");
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-5 text-black">
      <h2 className="text-2xl font-bold text-purple-800 text-center">🌸 Complete Your Sacred Profile</h2>

      <div>
        <label className="block font-semibold">📝 Short Bio</label>
        <textarea name="bio" onChange={handleChange} value={formData.bio} placeholder="e.g., A healer walking between worlds..." className="w-full border p-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold">🎓 Education Level</label>
        <input name="education_level" onChange={handleChange} value={formData.education_level} placeholder="e.g., Master's in Anthropology" className="w-full border p-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold">💼 Employment Status</label>
        <input name="employment_status" onChange={handleChange} value={formData.employment_status} placeholder="e.g., Independent Artisan" className="w-full border p-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold">💍 Marital Status</label>
        <input name="marital_status" onChange={handleChange} value={formData.marital_status} placeholder="e.g., Married, Single, etc." className="w-full border p-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold">📅 Date of Birth</label>
        <input name="dob" type="date" onChange={handleChange} value={formData.dob} className="w-full border p-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold">🗣️ Languages You Speak</label>
        <input name="language" onChange={handleChange} value={formData.language} placeholder="e.g., Nepal Bhasa, English" className="w-full border p-2 rounded" />
      </div>

      <button type="submit" className="w-full mt-4 bg-purple-700 hover:bg-purple-800 text-white py-2 rounded font-semibold text-lg">
        ✨ Save My Profile
      </button>
    </form>
  );
}
