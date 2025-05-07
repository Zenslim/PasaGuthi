// pages/network/welcome.jsx
import { useState } from 'react';
import Fuse from 'fuse.js';
import tharList from '../../data/tharList.json';
import { db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { toast } from 'react-hot-toast';

export default function WelcomeForm() {
  const [form, setForm] = useState({
    name: '',
    thar: '',
    phone: '',
    dob: '',
    location: '',
    role: '',
    skills: '',
    guthiRoles: '',
    languages: '',
    bio: '',
    whyProud: '',
    photoURL: ''
  });
  const [suggestedThar, setSuggestedThar] = useState([]);
  const fuse = new Fuse(tharList, { includeScore: true, threshold: 0.4 });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photoURL' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, photoURL: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      if (name === 'thar') {
        const results = fuse.search(value);
        setSuggestedThar(results.map((r) => r.item));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = form.name + '-' + form.thar;
    try {
      await setDoc(doc(db, 'users', uid), {
        ...form,
        createdAt: serverTimestamp(),
        karma: 0,
        presence: 'new'
      });
      toast.success('🌸 Welcome to the Guthi Circle!');
    } catch (err) {
      toast.error('Something went wrong.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-xl border border-gray-200 space-y-6"
      >
        <h1 className="text-3xl font-bold text-purple-600 text-center">
          🔆 Begin Your Presence in the Guthi Circle
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" name="name" placeholder="e.g. Anisha" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="label">Thar (Surname)</label>
            <div className="relative">
              <input
                className="input"
                name="thar"
                placeholder="e.g. Pradhan"
                onChange={handleChange}
                required
              />
              {form.thar && suggestedThar.length > 0 && (
                <ul className="absolute z-10 bg-white text-black border w-full rounded shadow">
                  {suggestedThar.map((s, idx) => (
                    <li
                      key={idx}
                      className="px-3 py-2 hover:bg-purple-100 cursor-pointer"
                      onClick={() => setForm((prev) => ({ ...prev, thar: s }))}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Phone</label>
            <PhoneInput
              defaultCountry="np"
              value={form.phone}
              onChange={(phone) => setForm((p) => ({ ...p, phone }))}
              inputClassName="input"
              placeholder="e.g. +977-9800000000"
            />
          </div>

          <div className="form-group">
            <label className="label">Date of Birth</label>
            <input className="input" type="date" name="dob" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="label">Location</label>
            <input className="input" name="location" placeholder="e.g. Kathmandu" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="label">Title / Role</label>
            <input className="input" name="role" placeholder="e.g. Artist, Developer" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="label">Skills</label>
            <input className="input" name="skills" placeholder="e.g. Singing, Teaching" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="label">Guthi Roles</label>
            <input className="input" name="guthiRoles" placeholder="e.g. Sponsor, Organizer" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="label">Languages</label>
            <input className="input" name="languages" placeholder="e.g. Nepal Bhasa, English" onChange={handleChange} />
          </div>

          <div className="form-group md:col-span-2">
            <label className="label">Your Bio / Intro</label>
            <textarea className="input" name="bio" placeholder="Tell us about yourself..." onChange={handleChange} />
          </div>

          <div className="form-group md:col-span-2">
            <label className="label">Why are you proud to be Newar?</label>
            <textarea className="input" name="whyProud" placeholder="Your cultural story..." onChange={handleChange} />
          </div>

          <div className="form-group md:col-span-2">
            <label className="label">Upload Profile Picture</label>
            <input type="file" name="photoURL" accept="image/*" className="text-black" onChange={handleChange} />
            {form.photoURL && <img src={form.photoURL} alt="Preview" className="w-24 h-24 rounded-full mt-2" />}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-lg font-semibold"
        >
          ✨ Join the Guthi
        </button>
      </form>
    </div>
  );
}

// Tailwind global styles
// .input { @apply w-full p-2 bg-white text-black border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400; }
// .label { @apply block text-sm font-medium text-gray-700 mb-1; }
// .form-group { @apply flex flex-col; }
