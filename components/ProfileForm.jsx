import { useState } from "react";

export default function ProfileForm({ onAdd }) {
  const [formData, setFormData] = useState({
    name: "", title: "", region: "", photo_url: "", bio: "",
    skills: "", guthi_roles: "", language: "", diaspora_node: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProfile = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()),
      guthi_roles: formData.guthi_roles.split(',').map(s => s.trim()),
      language: formData.language.split(',').map(s => s.trim()),
    };
    onAdd(newProfile);
    setFormData({
      name: "", title: "", region: "", photo_url: "", bio: "",
      skills: "", guthi_roles: "", language: "", diaspora_node: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 p-4 border rounded bg-white">
      <h2 className="text-lg font-bold mb-4">🧬 Add Full Profile</h2>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="block w-full border p-2 mb-2" required />
      <input name="title" value={formData.title} onChange={handleChange} placeholder="Role / Title" className="block w-full border p-2 mb-2" />
      <input name="region" value={formData.region} onChange={handleChange} placeholder="Region" className="block w-full border p-2 mb-2" />
      <input name="photo_url" value={formData.photo_url} onChange={handleChange} placeholder="Photo URL" className="block w-full border p-2 mb-2" />
      <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Short Bio" className="block w-full border p-2 mb-2" />
      <input name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills (comma separated)" className="block w-full border p-2 mb-2" />
      <input name="guthi_roles" value={formData.guthi_roles} onChange={handleChange} placeholder="Guthi Roles (comma separated)" className="block w-full border p-2 mb-2" />
      <input name="language" value={formData.language} onChange={handleChange} placeholder="Languages Spoken (comma separated)" className="block w-full border p-2 mb-2" />
      <label className="block text-sm mt-2">
        <input type="checkbox" name="diaspora_node" checked={formData.diaspora_node} onChange={handleChange} className="mr-2" />
        Is Diaspora Member?
      </label>
      <button type="submit" className="mt-4 bg-purple-600 text-white px-4 py-2 rounded">Save Profile</button>
    </form>
  );
}
