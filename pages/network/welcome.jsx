import { useState } from 'react';
import Fuse from 'fuse.js';
import tharList from '../../data/tharList.json';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { toast } from 'react-hot-toast';

export default function WelcomeForm() {
  const [form, setForm] = useState({ name: '', thar: '', gender: '' });
  const fuse = new Fuse(tharList, { includeScore: true, threshold: 0.4 });

  return (
    <div className="p-4">
      <h1>Welcome to PasaGuthi</h1>
      <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Thar" value={form.thar} onChange={e => setForm({ ...form, thar: e.target.value })} />
      <select onChange={e => setForm({ ...form, gender: e.target.value })}>
        <option value="">Select Gender</option>
        <option value="male">Sir</option>
        <option value="female">Ma'am</option>
      </select>
    </div>
  );
}
