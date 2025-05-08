
import React, { useState } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

export default function WelcomeForm() {
  const [form, setForm] = useState({
    name: '',
    thar: '',
    gender: '',
    phone: '',
    dob: '',
    address: '',
    bio: '',
    whyProud: '',
  });

  const [locationDenied, setLocationDenied] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGeolocate = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        const display = data.display_name || '';
        setForm((p) => ({ ...p, address: display }));
        setLocationDenied(false);
      },
      (err) => {
        console.error(err);
        setLocationDenied(true);
      }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-center text-2xl font-bold text-purple-700 mb-8">🌞 Join the Guthi Circle</h1>
      <div className="space-y-6">
        <div>
          <label className="font-semibold text-sm flex items-center gap-2">🙏 Your Name</label>
          <input
            name="name"
            placeholder="Your full name"
            className="w-full mt-1 px-4 py-2 border rounded-md bg-white text-black"
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="font-semibold text-sm flex items-center gap-2">🧑 Ma’am or Sir?</label>
          <select
            name="gender"
            className="w-full mt-1 px-4 py-2 border rounded-md bg-white text-black"
            onChange={handleChange}
            required
          >
            <option value="">Select...</option>
            <option value="female">Ma’am</option>
            <option value="male">Sir</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-sm flex items-center gap-2">🎂 Date of Birth</label>
          <input
            type="date"
            name="dob"
            className="w-full mt-1 px-4 py-2 border rounded-md bg-white text-black"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="font-semibold text-sm flex items-center gap-2">🏡 Where You Live
            <button
              type="button"
              onClick={handleGeolocate}
              className="ml-2 text-blue-600 text-sm hover:underline"
            >📍 Use My Location</button>
          </label>
          <input
            type="text"
            name="address"
            placeholder="Village, City, or Region"
            className="w-full mt-1 px-4 py-2 border rounded-md bg-white text-black"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        {locationDenied && (
          <div className="text-sm text-red-600">⚠️ Location not detected — please enter manually.</div>
        )}

        <div>
          <label className="font-semibold text-sm flex items-center gap-2">📜 Your Story</label>
          <textarea
            name="bio"
            placeholder="Tell us a little about yourself..."
            className="w-full mt-1 px-4 py-2 border rounded-md bg-white text-black"
            rows={3}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="font-semibold text-sm flex items-center gap-2">❤️ Why You’re Proud to Be Newar</label>
          <textarea
            name="whyProud"
            placeholder="Your roots, culture, or heart..."
            className="w-full mt-1 px-4 py-2 border rounded-md bg-white text-black"
            rows={3}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="font-semibold text-sm flex items-center gap-2">📞 Phone</label>
          <PhoneInput
            defaultCountry="np"
            value={form.phone}
            onChange={(phone) => setForm((p) => ({ ...p, phone }))}
            inputClassName="w-full px-4 py-2 border rounded-md bg-white text-black"
          />
        </div>

        <div>
          <label className="font-semibold text-sm flex items-center gap-2">📛 Your Thar</label>
          <input
            name="thar"
            placeholder="Your Thar / Surname"
            className="w-full mt-1 px-4 py-2 border rounded-md bg-white text-black"
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="font-semibold text-sm flex items-center gap-2">🖼️ Your Photo</label>
          <input
            type="file"
            name="photoURL"
            accept="image/*"
            className="w-full mt-1 px-4 py-2 border rounded-md bg-white text-black"
            onChange={handleChange}
          />
        </div>

        <button className="w-full py-3 mt-6 bg-purple-600 text-white rounded-md font-semibold">
          ✨ Join the Guthi
        </button>
      </div>
    </div>
  );
}
