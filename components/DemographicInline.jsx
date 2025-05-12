
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function DemographicInline({ guthiKey }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "", region: "", photo_url: "", bio: "",
    guthi_roles: "", language: "", diaspora_node: false,
    dob: "", education_level: "", employment_status: "", marital_status: ""
  });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `avatars/${guthiKey}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, imageFile, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let photoUrl = formData.photo_url;
    if (imageFile) {
      try {
        photoUrl = await handleImageUpload();
      } catch (err) {
        console.error("Upload error:", err);
        return alert("Photo upload failed.");
      }
    }

    const profile = {
      ...formData,
      guthiKey,
      photo_url: photoUrl,
      language: formData.language.split(',').map(s => s.trim()),
      guthi_roles: formData.guthi_roles.split(',').map(s => s.trim()),
      profile_completed: true,
    };

    const { error } = await supabase.from('users').update(profile).eq('guthiKey', guthiKey);
    if (error) return alert("Error saving profile.");
    router.push("/network/guthyars");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-purple-800">🌸 Complete Your Profile</h2>
      <input name="title" onChange={handleChange} value={formData.title} placeholder="Title / Role" className="w-full border p-2 rounded" />
      <input name="region" onChange={handleChange} value={formData.region} placeholder="Region" className="w-full border p-2 rounded" />
      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full p-2 border rounded" />
      <textarea name="bio" onChange={handleChange} value={formData.bio} placeholder="Short Bio" className="w-full border p-2 rounded" />
      <input name="education_level" onChange={handleChange} value={formData.education_level} placeholder="Education Level" className="w-full border p-2 rounded" />
      <input name="employment_status" onChange={handleChange} value={formData.employment_status} placeholder="Employment Status" className="w-full border p-2 rounded" />
      <input name="marital_status" onChange={handleChange} value={formData.marital_status} placeholder="Marital Status" className="w-full border p-2 rounded" />
      <input name="dob" type="date" onChange={handleChange} value={formData.dob} className="w-full border p-2 rounded" />
      <input name="language" onChange={handleChange} value={formData.language} placeholder="Languages (comma separated)" className="w-full border p-2 rounded" />
      <input name="guthi_roles" onChange={handleChange} value={formData.guthi_roles} placeholder="Guthi Roles (comma separated)" className="w-full border p-2 rounded" />
      <label className="block font-semibold">
        <input type="checkbox" name="diaspora_node" checked={formData.diaspora_node} onChange={handleChange} className="mr-2" />
        🌏 I am part of the Diaspora
      </label>
      <button type="submit" className="w-full mt-4 bg-purple-700 text-white py-2 rounded font-semibold">✨ Save My Profile</button>
    </form>
  );
}
