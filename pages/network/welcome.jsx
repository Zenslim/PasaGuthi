
import { useState } from "react";
import { completeOnboarding } from "../../lib/firestore";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";

export default function WelcomeOnboarding() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    thar: "",
    gender: "",
    phone: "",
    region: "",
    title: "",
    skills: "",
    guthi_roles: "",
    language: "",
    bio: "",
    diaspora_node: false,
    proud_message: "",
    whisper_text: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const formatted = {
      ...form,
      skills: form.skills.split(",").map(s => s.trim()),
      guthi_roles: form.guthi_roles.split(",").map(r => r.trim()),
      language: form.language.split(",").map(l => l.trim())
    };

    await completeOnboarding(user.uid, formatted);
    router.push("/network");
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-6">🪔 Begin Your Presence in the Guthi Circle</h1>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto grid gap-4">
        {[
          { label: "Your Name", name: "name" },
          { label: "Your Thar (Surname)", name: "thar" },
          { label: "Phone", name: "phone" },
          { label: "Location / Region", name: "region" },
          { label: "Title / Role", name: "title" },
          { label: "Skills (comma separated)", name: "skills" },
          { label: "Guthi Roles (comma separated)", name: "guthi_roles" },
          { label: "Languages (comma separated)", name: "language" },
          { label: "Your Bio / Intro", name: "bio" },
          { label: "Why are you proud to be Newar?", name: "proud_message" },
          { label: "Whisper a Sacred Vow", name: "whisper_text" }
        ].map(({ label, name }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="text"
              name={name}
              value={form[name]}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded"
              required={name !== 'proud_message' && name !== 'whisper_text'}
            />
          </div>
        ))}
        <div className="flex items-center">
          <input
            id="gender-m" type="radio" name="gender" value="male"
            onChange={handleChange}
            className="mr-1"
          /><label htmlFor="gender-m">Sir</label>
          <input
            id="gender-f" type="radio" name="gender" value="female"
            onChange={handleChange}
            className="ml-4 mr-1"
          /><label htmlFor="gender-f">Ma'am</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="diaspora_node"
            checked={form.diaspora_node}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm">I live outside Nepal (diaspora)</label>
        </div>
        <button type="submit" className="bg-purple-700 text-white px-6 py-2 rounded mt-4">
          ✨ Enter the Guthi
        </button>
      </form>
    </main>
  );
}
