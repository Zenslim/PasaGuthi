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
    address: '',
    street: '',
    town: '',
    region: '',
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
  const [locationDenied, setLocationDenied] = useState(false);
  const [showLocationButton, setShowLocationButton] = useState(false);
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
      if (name === 'address' && value.length >= 3) {
        setShowLocationButton(true);
      }
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    toast.loading('📍 Detecting your location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        toast.dismiss();
        const { latitude, longitude } = pos.coords;
        // Fake reverse geocode function for now
        const mockAddress = `Medford Street, Medford, Massachusetts, USA`;
        setForm((prev) => ({ ...prev, address: mockAddress }));
        toast.success('📍 Location detected');
      },
      (err) => {
        toast.dismiss();
        toast.error('Location access denied. Please fill in manually.');
        setLocationDenied(true);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = form.name + '-' + form.thar;
    const finalAddress = form.address || `${form.street}, ${form.town}, ${form.region}`;
    try {
      await setDoc(doc(db, 'users', uid), {
        ...form,
        address: finalAddress,
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
    <div className="min-h-screen bg-white text-black p-4">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-full space-y-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.h1 className="text-3xl font-bold text-purple-600 text-center" variants={fadeIn}>
          🔆 Join the Guthi Circle
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ['🙏 Your Name', 'name', 'Your full name'],
            ['🌬️ Your Thar', 'thar', 'Your Thar / Surname'],
            ['🧑‍⚖️ Ma’am or Sir?', 'gender', ''],
            ['📞 Phone', 'phone', 'Phone number'],
            ['🎂 Date of Birth', 'dob', '']
          ].map(([label, field, placeholder], i) => (
            <motion.div className="form-group" key={field} custom={i} variants={fadeIn}>
              <label className="label font-semibold block mb-1">{label}</label>
              <div className="border rounded-lg p-2">
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
                    required
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
              </div>
            </motion.div>
          ))}

          <motion.div className="form-group md:col-span-2" variants={fadeIn}>
            <label className="label font-semibold block mb-1">🏡 Where You Live</label>
            <div className="border rounded-lg p-2">
              <input
                className="input"
                name="address"
                placeholder="Village or Town"
                value={form.address}
                onChange={handleChange}
              />
              {showLocationButton && !locationDenied && (
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="mt-2 text-sm text-blue-600 underline"
                >
                  📍 Use My Location
                </button>
              )}
            </div>
          </motion.div>

          {locationDenied && (
            <motion.div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4" variants={fadeIn}>
              <div className="form-group">
                <label className="label font-semibold block mb-1">🏘 Street or Tole</label>
                <div className="border rounded-lg p-2">
                  <input name="street" className="input" onChange={handleChange} placeholder="e.g. Itachhen Tole" />
                </div>
              </div>
              <div className="form-group">
                <label className="label font-semibold block mb-1">🌆 Town / Village</label>
                <div className="border rounded-lg p-2">
                  <input name="town" className="input" onChange={handleChange} placeholder="e.g. Bhaktapur" />
                </div>
              </div>
              <div className="form-group">
                <label className="label font-semibold block mb-1">🌍 Province / Country</label>
                <div className="border rounded-lg p-2">
                  <input name="region" className="input" onChange={handleChange} placeholder="e.g. Bagmati, Nepal" />
                </div>
              </div>
            </motion.div>
          )}

          <motion.div className="form-group md:col-span-2" custom={10} variants={fadeIn}>
            <label className="label font-semibold block mb-1">📜 Your Story</label>
            <div className="border rounded-lg p-2">
              <textarea className="input" name="bio" placeholder="Tell us a little about yourself..." onChange={handleChange} />
            </div>
          </motion.div>

          <motion.div className="form-group md:col-span-2" custom={11} variants={fadeIn}>
            <label className="label font-semibold block mb-1">❤️ Why You’re Proud to Be Newar</label>
            <div className="border rounded-lg p-2">
              <textarea className="input" name="whyProud" placeholder="Your roots, culture, or heart..." onChange={handleChange} />
            </div>
          </motion.div>

          <motion.div className="form-group md:col-span-2" custom={12} variants={fadeIn}>
            <label className="label font-semibold block mb-1">🖼️ Your Photo</label>
            <div className="border rounded-lg p-2">
              <input type="file" name="photoURL" accept="image/*" className="text-black" onChange={handleChange} />
              {form.photoURL && <img src={form.photoURL} alt="Preview" className="w-24 h-24 rounded-full mt-2" />}
            </div>
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
// .label { @apply block text-sm font-medium text-gray-700; }
// .form-group { @apply flex flex-col relative; }
