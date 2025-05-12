import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function DemographicForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "", region: "", photo_url: "", bio: "",
    guthi_roles: "", language: "", diaspora_node: false,
    dob: "", education_level: "", employment_status: "", marital_status: ""
  });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageUpload = async (uid) => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `avatars/${uid}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, imageFile, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await supabase.auth.getUser();
    const uid = user?.data?.user?.id;
    if (!uid) return alert("Not authenticated");

    let photoUrl = formData.photo_url;
    if (imageFile) {
      try {
        photoUrl = await handleImageUpload(uid);
      } catch (err) {
        console.error("Photo upload error:", err);
        return alert("Failed to upload photo.");
      }
    }

    const profile = {
      ...formData,
      id: uid,
      photo_url: photoUrl,
      language: formData.language.split(',').map(s => s.trim()),
      guthi_roles: formData.guthi_roles.split(',').map(s => s.trim()),
      profile_completed: true,
    };

    const { error } = await supabase.from('users').upsert(profile, { onConflict: 'id' });
    if (error) {
      console.error(error);
      return alert("Error saving profile");
    }

    router.push("/network/guthyars");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-purple-800">🌿 Demographic Details</h2>

      <label className="block font-semibold">💼 Title / Role</label>
      <input name="title" onChange={handleChange} value={formData.title} placeholder="e.g., Artist, Teacher" className="w-full border p-2 rounded" />

      <label className="block font-semibold">🌍 Current Region</label>
      <input name="region" onChange={handleChange} value={formData.region} placeholder="e.g., Kathmandu, Boston" className="w-full border p-2 rounded" />

      <label className="block font-semibold">🖼 Upload Profile Photo</label>
      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full p-2 border rounded" />

      <label className="block font-semibold">📝 Short Bio</label>
      <textarea name="bio" onChange={handleChange} value={formData.bio} placeholder="A few lines about yourself" className="w-full border p-2 rounded" />

      <label className="block font-semibold">🎓 Education Level</label>
      <input name="education_level" onChange={handleChange} value={formData.education_level} placeholder="e.g., Bachelor's, No formal" className="w-full border p-2 rounded" />

      <label className="block font-semibold">💼 Employment Status</label>
      <input name="employment_status" onChange={handleChange} value={formData.employment_status} placeholder="e.g., Self-employed, Student" className="w-full border p-2 rounded" />

      <label className="block font-semibold">💍 Marital Status</label>
      <input name="marital_status" onChange={handleChange} value={formData.marital_status} placeholder="e.g., Married, Single" className="w-full border p-2 rounded" />

      <label className="block font-semibold">🎂 Date of Birth</label>
      <input name="dob" type="date" onChange={handleChange} value={formData.dob} className="w-full border p-2 rounded" />

      <label className="block font-semibold">🗣 Languages (comma separated)</label>
      <input name="language" onChange={handleChange} value={formData.language} placeholder="e.g., Newar, Nepali" className="w-full border p-2 rounded" />

      <label className="block font-semibold">🪷 Guthi Roles (comma separated)</label>
      <input name="guthi_roles" onChange={handleChange} value={formData.guthi_roles} placeholder="e.g., Guardian, Weaver" className="w-full border p-2 rounded" />

      <label className="block font-semibold">
        <input type="checkbox" name="diaspora_node" checked={formData.diaspora_node} onChange={handleChange} className="mr-2" />
        🌏 I am part of the Diaspora
      </label>

      <button type="submit" className="w-full mt-4 bg-purple-700 text-white py-2 rounded font-semibold">✨ Save My Profile</button>
    </form>
  );
}
