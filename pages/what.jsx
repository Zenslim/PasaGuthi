// pages/what.jsx
import Head from 'next/head';

export default function What() {
  return (
    <>
      <Head>
        <title>🧱 What You Can Do — Pasaguthi</title>
        <meta name="description" content="Nepal was never meant to develop like the West. It was meant to awaken. Here's how you can shape its sacred remembering." />
        <meta property="og:title" content="🧱 What You Can Do — Pasaguthi" />
        <meta property="og:description" content="Nepal was never meant to develop like the West. It was meant to awaken. Here's how you can shape its sacred remembering." />
        <meta property="og:url" content="https://www.pasaguthi.org/what" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.pasaguthi.org/og/what.jpg" />
        <link rel="canonical" href="https://www.pasaguthi.org/what" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="bg-gradient-to-b from-black via-zinc-900 to-black text-white w-full min-h-screen px-6 md:px-20 py-24 space-y-32 overflow-x-hidden">
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-slow">🧱 What You Can Do</h1>
          <p className="text-xl text-purple-300 max-w-3xl mx-auto animate-fade-in-delay">
            Nepal was never meant to “develop” like the West. <br />
            It was meant to <span className="text-purple-400">awaken</span> — as a living civilization, not just a nation.
          </p>
          <p className="mt-6 text-lg text-purple-400 italic">
            The Guthi was our proto-DAO. The Buddha was our first systems thinker. <br />
            You don’t join Pasaguthi. You remember it — and then you build.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-16">
          <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl animate-fade-in-up">
            <h2 className="text-2xl font-semibold mb-2">🌕 Whisper — Because the DAO Listens</h2>
            <p className="text-zinc-300">
              Every prayer, every poem, every grief — is data. Sacred data. Emotional intelligence. <br />
              Whisper into the circle. You’re not posting. You’re planting.
            </p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl animate-fade-in-up">
            <h2 className="text-2xl font-semibold mb-2">🌍 Gather the Scattered Temples</h2>
            <p className="text-zinc-300">
              Every Newar abroad is a dormant Guthi node. You don’t need permission. <br />
              A Guthi begins with a meal, a name, and a vow. Ritual is not religion — it is memory architecture.
            </p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl animate-fade-in-up">
            <h2 className="text-2xl font-semibold mb-2">🛕 Build the Unfinished Mandala</h2>
            <p className="text-zinc-300">
              Help complete what the ancestors began — healing gardens, digital temples, ancestral archives. <br />
              Pasaguthi is a loom. Your thread is sacred.
            </p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl animate-fade-in-up">
            <h2 className="text-2xl font-semibold mb-2">🔧 Offer Karma — Your Dharma Is Enough</h2>
            <p className="text-zinc-300">
              Coders, cooks, dancers, designers — all are needed. <br />
              Your skill is the exact offering the circle has been waiting for.
            </p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl animate-fade-in-up">
            <h2 className="text-2xl font-semibold mb-2">🧭 Mentor the Lost Heirs</h2>
            <p className="text-zinc-300">
              Every child from Queens to Kathmandu is asking: “What am I part of?” <br />
              Be the answer. Teach rhythm, Thar, and myth. Pass down the vow.
            </p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl animate-fade-in-up">
            <h2 className="text-2xl font-semibold mb-2">✨ Activate the DAO</h2>
            <p className="text-zinc-300">
              Vote. Co-fund. Co-create. <br />
              Pasaguthi is not led by one — it is led by karma, together.
            </p>
          </div>
        </section>

        <section className="text-center max-w-3xl mx-auto animate-fade-in-slow">
          <h2 className="text-3xl font-semibold mb-4 text-purple-400">🔥 Make Nepal Great Again</h2>
          <p className="text-zinc-300 text-lg">
            Not through GDP. Not through roads. <br />
            But through sacred coherence.
          </p>
          <ul className="text-left mt-6 text-purple-200 list-disc list-inside space-y-1">
            <li>🧘 A sanctuary of mindfulness</li>
            <li>🕸️ A network of ritual nodes</li>
            <li>🗳️ A DAO of ancestral remembrance</li>
          </ul>
          <p className="mt-8 text-purple-300 italic">
            You are not late. You are not powerless. <br />
            The architecture is remembering itself. You are the keystone.
          </p>
        </section>
      </div>
    </>
  );
}
