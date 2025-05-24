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

      <main className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6 py-24">
        {/* Centered Logo */}
        <img
          src="/pasaguthi-logo.png"
          alt="Pasaguthi"
          className="h-40 w-40 mb-8 animate-fade-in-slow drop-shadow-xl"
        />

        {/* Hero Text */}
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

        {/* Tracker + Text */}
        <div className="flex flex-col items-center mt-6 animate-fade-in-delay">
          <MycelialTracker count={7} />
          <p className="text-sm text-purple-400 mt-1 font-medium">
            7 of 13 Whispers Awakened!
          </p>
          <p className="text-sm text-purple-500 mt-1 italic">
            6 Whispers Left... Will Yours Be One?
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
