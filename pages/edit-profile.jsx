
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function EditProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    bio: "",
    education_level: "",
    employment_status: "",
    marital_status: "",
    dob: "",
    language: ""
  });
  const [loading, setLoading] = useState(true);
  const [guthiKey, setGuthiKey] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const key = localStorage.getItem('guthiKey');
      if (!key) return router.push('/welcome');
      setGuthiKey(key);
      const { data, error } = await supabase.from('users').select('*').eq('guthiKey', key).single();
      if (error || !data) return console.error("User not found:", error);
      setFormData({
        bio: data.bio || '',
        education_level: data.education_level || '',
        employment_status: data.employment_status || '',
        marital_status: data.marital_status || '',
        dob: data.dob || '',
        language: data.language || ''
      });
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const update = {
      ...formData,
      language: formData.language, // as string
    };
    const { error } = await supabase.from('users').update(update).eq('guthiKey', guthiKey);
    if (error) return alert("Update failed");
    router.push('/dashboard');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading profile...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-5 text-black">
      <h2 className="text-2xl font-bold text-purple-800 text-center">🛠️ Edit Your Sacred Profile</h2>

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
        💾 Save Changes
      </button>
    </form>
  );
}
