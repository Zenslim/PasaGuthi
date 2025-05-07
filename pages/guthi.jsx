import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState } from 'react';

const prompts = [
  "What does heritage mean to you?",
  "What ancestral story guides your path?",
  "How do you honor your land, breath, and body?"
];

export default function Guthi() {
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setReflection(''), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white p-6">
        <h1 className="text-3xl font-bold mb-4">Zen Guthi Reflection Portal</h1>
        <p className="text-lg italic text-purple-700 mb-4">“{prompt}”</p>
        <textarea
          rows="6"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Begin your sacred reflection here..."
          className="w-full p-4 border rounded mb-4"
        />
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Send Reflection
        </button>
        {submitted && <p className="mt-4 text-green-700">🌸 Reflection sent to the Guthi.</p>}
      </main>
      <Footer />
    </>
  );
}
