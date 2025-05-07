// pages/network/welcome.jsx
import { useState, useEffect } from 'react';
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">
        🔅 Begin Your Presence in the Guthi Circle
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input" name="name" placeholder="Your Name" onChange={handleChange} />
        <div className="relative">
          <input
            className="input"
            name="thar"
            placeholder="Your Thar (Surname)"
            onChange={handleChange}
          />
          {form.thar && suggestedThar.length > 0 && (
            <ul className="absolute z-10 bg-white shadow rounded w-full">
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
        <PhoneInput defaultCountry="np" value={form.phone} onChange={(phone) => setForm((p) => ({ ...p, phone }))} />
        <input className="input" type="date" name="dob" placeholder="Date of Birth" onChange={handleChange} />
        <input className="input" name="location" placeholder="Location / Region" onChange={handleChange} />
        <input className="input" name="role" placeholder="Title / Role" onChange={handleChange} />
        <input className="input" name="skills" placeholder="Skills (comma separated)" onChange={handleChange} />
        <input className="input" name="guthiRoles" placeholder="Guthi Roles (comma separated)" onChange={handleChange} />
        <input className="input" name="languages" placeholder="Languages (comma separated)" onChange={handleChange} />
        <textarea className="input" name="bio" placeholder="Your Bio / Intro" onChange={handleChange} />
        <textarea className="input" name="whyProud" placeholder="Why are you proud to be Newar?" onChange={handleChange} />

        <label className="block text-sm font-medium text-gray-700">Upload Profile Picture</label>
        <input
          className="input"
          type="file"
          accept="image/*"
          name="photoURL"
          onChange={handleChange}
        />
        {form.photoURL && <img src={form.photoURL} alt="Preview" className="w-24 h-24 rounded-full mt-2" />}

        <button type="submit" className="bg-purple-700 text-white px-6 py-2 rounded hover:bg-purple-800">
          ✨ Join the Guthi
        </button>
      </form>
    </div>
  );
}

// .input class should be styled in global CSS as previously advised
