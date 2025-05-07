// pages/network/welcome.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
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
    gender: '',
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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } })
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-xl border border-gray-200 space-y-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.h1 className="text-3xl font-bold text-purple-600 text-center" variants={fadeIn}>
          🔆 Begin Your Presence in the Guthi Circle
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ['🙏 What name shall we greet you by?', 'name', 'Your full name'],
            ['🌬️ Which Thar do you carry in your breath?', 'thar', 'Your Thar / Surname'],
            ['🧑‍⚖️ Shall we address you as Ma’am or Sir?', 'gender', ''],
            ['📞 Your contact number', 'phone', 'Phone number'],
            ['🎂 When did you arrive in this world?', 'dob', ''],
            ['🏡 Where do your feet rest now?', 'location', 'Your current place'],
            ['💼 Your present walk / title', 'role', 'Profession or contribution'],
            ['🎁 Do you carry a gift, skill, or vow?', 'skills', 'Your talents or offerings'],
            ['🕊️ What Guthi role resonates with you?', 'guthiRoles', 'Sponsor, Organizer, Cook...'],
            ['🗣️ Tongues you speak', 'languages', 'Languages spoken']
          ].map(([label, field, placeholder], i) => (
            <motion.div className="form-group" key={field} custom={i} variants={fadeIn}>
              <label className="label font-semibold">{label}</label>
              {field === 'gender' ? (
                <select name="gender" className="input" onChange={handleChange} required>
                  <option value="">Select...</option>
                  <option value="female">Ma’am</option>
                  <option value="male">Sir</option>
                </select>
              ) : field === 'phone' ? (
                <PhoneInput
                  defaultCountry="np"
                  value={form.phone}
                  onChange={(phone) => setForm((p) => ({ ...p, phone }))}
                  inputClassName="input"
                  placeholder={placeholder}
                />
              ) : field === 'dob' ? (
                <input className="input" type="date" name="dob" onChange={handleChange} />
              ) : (
                <input
                  className="input"
                  name={field}
                  placeholder={placeholder}
                  onChange={handleChange}
                  required={field !== 'location'}
                />
              )}
              {field === 'thar' && form.thar && suggestedThar.length > 0 && (
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
            </motion.div>
          ))}

          <motion.div className="form-group md:col-span-2" custom={10} variants={fadeIn}>
            <label className="label font-semibold">📜 Whisper your story to us</label>
            <textarea className="input" name="bio" placeholder="A short introduction..." onChange={handleChange} />
          </motion.div>

          <motion.div className="form-group md:col-span-2" custom={11} variants={fadeIn}>
            <label className="label font-semibold">❤️ What makes you proud to be Newar?</label>
            <textarea className="input" name="whyProud" placeholder="Cultural pride, roots, rituals..." onChange={handleChange} />
          </motion.div>

          <motion.div className="form-group md:col-span-2" custom={12} variants={fadeIn}>
            <label className="label font-semibold">🖼️ A picture to remember you by</label>
            <input type="file" name="photoURL" accept="image/*" className="text-black" onChange={handleChange} />
            {form.photoURL && <img src={form.photoURL} alt="Preview" className="w-24 h-24 rounded-full mt-2" />}
          </motion.div>
        </div>

        <motion.button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-lg font-semibold"
          variants={fadeIn}
          custom={13}
        >
          ✨ Join the Guthi
        </motion.button>
      </motion.form>
    </div>
  );
}

// Tailwind global styles
// .input { @apply w-full p-2 bg-white text-black border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400; }
// .label { @apply block text-sm font-medium text-gray-700 mb-1; }
// .form-group { @apply flex flex-col relative; }
