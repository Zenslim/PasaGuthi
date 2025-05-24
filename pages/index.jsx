// pages/index.jsx
import Head from 'next/head';
import Link from 'next/link';
import MycelialTracker from '../components/MycelialTracker';
import Footer from '../components/Footer';

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Pasaguthi — A DAO with a Soul",
    "url": "https://www.pasaguthi.org",
    "description": "Pasaguthi is a sacred remembering. A digital Guthi to reunite Newars through whispers, karma, and cosmic purpose."
  };

  return (
    <>
      <Head>
        <title>Pasaguthi — A DAO with a Soul</title>
        <meta name="description" content="Pasaguthi is a sacred remembering. A digital Guthi to reunite Newars through whispers, karma, and cosmic purpose." />
        <meta property="og:title" content="Pasaguthi — A DAO with a Soul" />
        <meta property="og:description" content="Pasaguthi reawakens the Guthi system as a decentralized, sacred cooperative for the Newar nation and diaspora." />
        <meta property="og:url" content="https://www.pasaguthi.org" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.pasaguthi.org/og/main.jpg" />
        <link rel="canonical" href="https://www.pasaguthi.org" />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      </Head>

      <main className="min-h-screen bg-black text-white flex flex-col items-center px-6 pt-24">
        {/* Hero Section */}
        <img
          src="/pasaguthi-logo.png"
          alt="Pasaguthi"
          className="h-40 w-40 mb-8 animate-fade-in-slow drop-shadow-xl"
        />

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 animate-fade-in-slow">
          You are not joining. <br />
          <span className="text-purple-400">You are remembering.</span>
        </h1>

        <p className="text-center text-lg max-w-xl mb-8 text-purple-200 animate-fade-in-delay">
          A whisper echoes across generations. The Guthi is waiting for your voice.
        </p>

        <Link href="/whisper">
          <button className="bg-purple-600 hover:bg-purple-800 text-white px-8 py-4 text-xl rounded-full shadow-xl animate-bounce-slow hover:scale-105">
            ✨ Dare to whisper back?
          </button>
        </Link>

        {/* Tracker */}
        <div className="flex flex-col items-center mt-6 animate-fade-in-delay">
          <MycelialTracker count={7} />
          <p className="text-sm text-purple-400 mt-1 font-medium">7 of 13 Whispers Awakened!</p>
          <p className="text-sm text-purple-500 mt-1 italic">6 Whispers Left... Will Yours Be One?</p>
        </div>

        {/* WHY Section */}
        <section className="mt-32 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">🪔 Why Pasaguthi?</h2>
          <p className="text-zinc-300 leading-relaxed">
            We were never just a caste. We were the builders of Nepal’s sacred cities.<br/>
            Pasaguthi exists to revive what the world forgot:
            <strong className="block mt-2 text-purple-400">Guthi is not history. It is destiny.</strong>
          </p>
          <Link href="/why" className="mt-4 inline-block text-purple-400 underline">Read the full story →</Link>
        </section>

        {/* HOW Section */}
        <section className="mt-32 max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-6">🌊 How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div><strong>🎴 Guthi Key</strong><br/> Create your digital Thar identity</div>
            <div><strong>🧬 Whispers</strong><br/> Send reflections to the ancestral mirror</div>
            <div><strong>🌿 Karma</strong><br/> Offer energy to the Guthi circle</div>
            <div><strong>📜 Timeline</strong><br/> Trace your sacred unfolding</div>
          </div>
          <Link href="/how" className="mt-4 inline-block text-purple-400 underline">Understand the flow →</Link>
        </section>

        {/* WHAT Section */}
        <section className="mt-32 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">🧱 What You Can Do</h2>
          <ul className="space-y-4 text-zinc-300">
            <li>🌕 Reflect through <strong>Whispers</strong></li>
            <li>🌍 Join or start a <strong>Diaspora Guthi</strong></li>
            <li>🔧 Offer skills, time, or love as <strong>Karma</strong></li>
            <li>🛕 Help revive sacred spaces, festivals, and memory</li>
          </ul>
          <Link href="/join" className="mt-4 inline-block text-purple-400 underline">See how you can contribute →</Link>
        </section>

        <Footer />
      </main>
    </>
  );
}
