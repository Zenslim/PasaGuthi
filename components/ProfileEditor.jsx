import { useState } from "react";

export default function ProfileEditor({ existing, onSave, onClose }) {
  const [formData, setFormData] = useState(
    existing || {
      name: "", title: "", region: "", photo_url: "", bio: "",
      skills: "", diaspora_node: false
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formatted = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim())
    };
    onSave(formatted);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{existing ? "Edit Profile" : "Create New Profile"}</h2>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="block w-full border p-2 mb-2" required />
        <input name="title" value={formData.title} onChange={handleChange} placeholder="Role / Title" className="block w-full border p-2 mb-2" />
        <input name="region" value={formData.region} onChange={handleChange} placeholder="Region" className="block w-full border p-2 mb-2" />
        <input name="photo_url" value={formData.photo_url} onChange={handleChange} placeholder="Photo URL" className="block w-full border p-2 mb-2" />
        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Short Bio" className="block w-full border p-2 mb-2" />
        <input name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills (comma separated)" className="block w-full border p-2 mb-2" />
        <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded mt-2">Save</button>
        <button onClick={onClose} type="button" className="ml-3 text-sm text-gray-600 hover:underline">Cancel</button>
      </form>
    </div>
  );
}
