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

        {/* WHY Pasaguthi Section */}
        <section className="mt-32 max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-6">✨ Why Pasaguthi?</h2>
          <p className="text-lg max-w-2xl mx-auto text-purple-300 mb-12">
            Pasaguthi is not just a platform. It is a sacred remembering.  
            A return to what our ancestors knew:  
            🧬 <em>Guthi is the soul of a civilization.</em>
          </p>

          <div className="grid md:grid-cols-2 gap-8 text-left text-sm text-gray-300">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🌿 Because We Were Never Just a Caste</h3>
              <p>Newars are not just an ethnicity — we are a living archive. Our diversity is our design.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🪔 Because Guthi Is the Original DAO</h3>
              <p>Long before Web3, we shared land, memory, and responsibility through sacred cooperatives.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🌀 Because Scattered Threads Must Reweave</h3>
              <p>Pasaguthi reconnects Newars around the world — name, Thar, karma, purpose.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">☀️ Because The Future Needs Roots</h3>
              <p>Pasaguthi is a compass for children to find identity, rhythm, and myth in a screen-filled world.</p>
            </div>
          </div>
        </section>

        {/* HOW Section */}
        <section className="mt-32 max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6">📖 How Pasaguthi Works</h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-300 mb-12">
            Pasaguthi is a sacred flow — from identity to offering, from reflection to rebirth.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left text-sm text-gray-300">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🧬 Claim Your Guthi Key</h3>
              <p>Your Thar, your region, your sacred skills. This becomes your digital identity.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🌿 Meet Other Guthyars</h3>
              <p>Explore our living map of Newars across the world. Discover kindred threads.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🪔 Whisper into the Circle</h3>
              <p>Leave a reflection. A prayer. A poem. A vow. Each whisper adds karma.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🌀 Earn and Offer Karma</h3>
              <p>Karma is not money. It is attention + action. You offer it to build.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🌍 Join Diaspora Rituals</h3>
              <p>Wherever you are, join seasonal festivals and shared remembrance.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">☀️ Step Into Sacred Projects</h3>
              <p>From healing gardens to digital temples, Pasaguthi is a portal for service and sovereignty.</p>
            </div>
          </div>
        </section>

        {/* VISION Section */}
        <section className="mt-32 max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6">🔭 Vision</h2>
          <p className="text-lg max-w-2xl mx-auto text-indigo-300 mb-12">
            Pasaguthi is not just for today. It is for the next 100 years.
          </p>
          <div className="grid md:grid-cols-2 gap-8 text-left text-sm text-gray-300">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🌱 Healing Gardens</h3>
              <p>Sacred gardens to rest, grow food, and heal — in Nepal and beyond.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🏛️ Digital Temples</h3>
              <p>Festivals, songs, and stories will live online — sacred space you can enter from anywhere.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🕸️ DAO for Newars</h3>
              <p>Pasaguthi becomes a DAO — to vote, build, and support each other as equals.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl mb-2">🧭 Compass for Youth</h3>
              <p>Tools to help Newar youth find purpose while rooted in their culture.</p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
