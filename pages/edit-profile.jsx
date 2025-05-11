import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';
import withAuth from '../lib/withAuth';

function EditProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    thar: '',
    region: '',
    skills: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const guthiKey = localStorage.getItem('guthiKey');
      if (!guthiKey) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('guthiKey', guthiKey)
        .single();

      if (data) {
        setForm({
          name: data.name,
          thar: data.thar,
          region: data.region,
          skills: data.skills,
          phone: data.phone || '',
          password: ''
        });
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const guthiKey = localStorage.getItem('guthiKey');
    if (!guthiKey) return;

    let updateData = {
      name: form.name,
      thar: form.thar,
      region: form.region,
      skills: form.skills,
      phone: form.phone
    };

    if (form.password.trim()) {
      updateData.password = await bcrypt.hash(form.password.trim(), 10);
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('guthiKey', guthiKey);

    if (!error) {
      localStorage.setItem('userName', form.name);
      router.push('/dashboard');
    } else {
      console.error('❌ Update failed:', error);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">🌿 Loading your profile...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black px-6">
      <form onSubmit={handleSave} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center mb-2">📝 Edit Guthi Profile</h1>

        {['name', 'thar', 'region', 'skills', 'phone'].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            className="w-full p-2 border rounded"
          />
        ))}

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="New Password (optional)"
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          💾 Save Profile
        </button>
      </form>
    </div>
  );
}

export default withAuth(EditProfile);
