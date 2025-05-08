
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
    name: '', thar: '', phone: '', dob: '', address: '',
    street: '', town: '', region: '', role: '', skills: '',
    guthiRoles: '', languages: '', gender: '', bio: '',
    whyProud: '', photoURL: ''
  });
  const [suggestedThar, setSuggestedThar] = useState([]);
  const [locationDenied, setLocationDenied] = useState(false);
  const [showLocationButton, setShowLocationButton] = useState(false);

  const fuse = new Fuse(tharList, { includeScore: true, threshold: 0.4 });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photoURL' && files?.[0]) {
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

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      return data.display_name || \`\${lat}, \${lon}\`;
    } catch {
      return \`\${lat}, \${lon}\`;
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    toast.loading('📍 Detecting your location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const address = await reverseGeocode(latitude, longitude);
        toast.dismiss();
        setForm((prev) => ({ ...prev, address }));
        toast.success('📍 Location detected');
      },
      () => {
        toast.dismiss();
        toast.error('Location access denied. Please fill in manually.');
        setLocationDenied(true);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = \`\${form.name}-\${form.thar}\`;
    const finalAddress = form.address || \`\${form.street}, \${form.town}, \${form.region}\`;
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
        className="space-y-6 max-w-2xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.h1 className="text-3xl font-bold text-purple-600 text-center" variants={fadeIn}>
          🔆 Join the Guthi Circle
        </motion.h1>

        {[
          ['🙏 Your Name', 'name', 'Your full name'],
          ['🌬️ Your Thar', 'thar', 'Your Thar / Surname'],
          ["🧑‍⚖️ Ma'am or Sir?", 'gender', ''],
          ['📞 Phone', 'phone', 'Phone number'],
          ['🎂 Date of Birth', 'dob', '']
        ].map(([label, field, placeholder], i) => (
          <motion.div key={field} className="form-group" custom={i} variants={fadeIn}>
            <label className="label">{label}</label>
            <div className="w-full">
              {field === 'gender' ? (
                <select name="gender" className="input w-full" onChange={handleChange} required>
                  <option value="">Select...</option>
                  <option value="female">Ma’am</option>
                  <option value="male">Sir</option>
                </select>
              ) : field === 'phone' ? (
                <PhoneInput
                  defaultCountry="np"
                  value={form.phone}
                  onChange={(phone) => setForm((p) => ({ ...p, phone }))}
                  inputClassName="input w-full"
                  placeholder={placeholder}
                />
              ) : field === 'dob' ? (
                <input className="input w-full" type="date" name="dob" onChange={handleChange} />
              ) : (
                <input className="input w-full" name={field} placeholder={placeholder} onChange={handleChange} required />
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

        <motion.div className="form-group" variants={fadeIn}>
          <label className="label">🏡 Where You Live</label>
          <div className="w-full">
            <input
              className="input w-full"
              name="address"
              placeholder="Village or Town"
              value={form.address}
              onChange={handleChange}
            />
            {showLocationButton && !locationDenied && (
              <button
                type="button"
                onClick={handleDetectLocation}
                className="mt-2 text-sm text-blue-600"
              >
                📍 Use My Location
              </button>
            )}
          </div>
        </motion.div>

        {locationDenied && (
          <motion.div className="space-y-4" variants={fadeIn}>
            {[
              ['🏘 Street or Tole', 'street', 'e.g. Itachhen Tole'],
              ['🌆 Town / Village', 'town', 'e.g. Bhaktapur'],
              ['🌍 Province / Country', 'region', 'e.g. Bagmati, Nepal']
            ].map(([label, field, placeholder], i) => (
              <div key={field} className="form-group">
                <label className="label">{label}</label>
                <input name={field} className="input w-full" onChange={handleChange} placeholder={placeholder} />
              </div>
            ))}
          </motion.div>
        )}

        {[
          ['📜 Your Story', 'bio', 'Tell us a little about yourself...'],
          ['❤️ Why You’re Proud to Be Newar', 'whyProud', 'Your roots, culture, or heart...']
        ].map(([label, field, placeholder], i) => (
          <motion.div key={field} className="form-group" custom={10 + i} variants={fadeIn}>
            <label className="label">{label}</label>
            <textarea className="input w-full" name={field} placeholder={placeholder} onChange={handleChange} />
          </motion.div>
        ))}

        <motion.div className="form-group" custom={12} variants={fadeIn}>
          <label className="label">🖼️ Your Photo</label>
          <input type="file" name="photoURL" accept="image/*" className="text-black w-full" onChange={handleChange} />
          {form.photoURL && <img src={form.photoURL} alt="Preview" className="w-24 h-24 rounded-full mt-2" />}
        </motion.div>

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
