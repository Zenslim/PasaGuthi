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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl space-y-4 bg-zinc-900 p-6 rounded-xl shadow-xl"
      >
        <h1 className="text-3xl font-bold text-purple-400 mb-2 text-center">
          🔆 Begin Your Presence in the Guthi Circle
        </h1>

        <input className="input" name="name" placeholder="Your Name" onChange={handleChange} required />

        <div className="relative">
          <input
            className="input"
            name="thar"
            placeholder="Your Thar (Surname)"
            onChange={handleChange}
            required
          />
          {form.thar && suggestedThar.length > 0 && (
            <ul className="absolute z-10 bg-white text-black rounded w-full">
              {suggestedThar.map((s, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                  onClick={() => setForm((prev) => ({ ...prev, thar: s }))}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <PhoneInput
          defaultCountry="np"
          value={form.phone}
          onChange={(phone) => setForm((p) => ({ ...p, phone }))}
          inputClassName="input"
        />

        <input className="input" type="date" name="dob" onChange={handleChange} />
        <div className="flex flex-col md:flex-row gap-4">
          <input className="input flex-1" name="location" placeholder="Location / Region" onChange={handleChange} />
          <input className="input flex-1" name="role" placeholder="Title / Role" onChange={handleChange} />
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
          <input className="input" name="skills" placeholder="Skills (comma separated)" onChange={handleChange} />
          <input className="input" name="guthiRoles" placeholder="Guthi Roles (comma separated)" onChange={handleChange} />
          <input className="input" name="languages" placeholder="Languages (comma separated)" onChange={handleChange} />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <textarea className="input flex-1" name="bio" placeholder="Your Bio / Intro" onChange={handleChange} />
          <textarea
            className="input flex-1"
            name="whyProud"
            placeholder="Why are you proud to be Newar?"
            onChange={handleChange}
          />
        </div>

        <label className="text-sm">Upload Profile Picture</label>
        <input type="file" name="photoURL" accept="image/*" className="text-white" onChange={handleChange} />
        {form.photoURL && <img src={form.photoURL} alt="Preview" className="w-24 h-24 rounded-full mt-2" />}

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

// globals.css or component styles should include:
// .input {
//   @apply w-full p-2 bg-zinc-800 text-white border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500;
// }
