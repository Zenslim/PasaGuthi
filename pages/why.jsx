import Head from 'next/head';

export default function WhyPasaGuthi() {
  return (
    <>
      <Head>
        <title>Why PasaGuthi? — Sacred Return</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-gray-900 text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-6">✨ Why PasaGuthi?</h1>
        <p className="text-lg max-w-2xl mx-auto text-purple-300 mb-12">
          PasaGuthi is not just a platform. It is a sacred remembering.  
          A return to what our ancestors knew:  
          🧬 <em>Guthi is the soul of a civilization.</em>
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
          {/* Original blocks */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-purple-600 transition">
            <h2 className="text-2xl mb-2">🌿 Because We Were Never Just a Caste</h2>
            <p className="text-sm text-gray-300">
              Newars are not just an ethnicity — we are a living archive.  
              Artisans, priests, farmers, traders, warriors, mystics.  
              Our diversity is our design.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-purple-600 transition">
            <h2 className="text-2xl mb-2">🪔 Because Guthi Is the Original DAO</h2>
            <p className="text-sm text-gray-300">
              Long before Web3, we shared land, memory, and responsibility  
              through sacred cooperatives.  
              PasaGuthi brings that back — not with tech hype, but soul alignment.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-purple-600 transition">
            <h2 className="text-2xl mb-2">🌀 Because Scattered Threads Must Reweave</h2>
            <p className="text-sm text-gray-300">
              Newars are now everywhere — Boston, Berlin, Bhaktapur.  
              But our digital heart was missing. Until now.  
              PasaGuthi reconnects us — name, Thar, karma, purpose.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-purple-600 transition">
            <h2 className="text-2xl mb-2">☀️ Because The Future Needs Roots</h2>
            <p className="text-sm text-gray-300">
              Our children need more than screens.  
              They need identity, rhythm, belonging, and myth.  
              PasaGuthi is their compass — grounded, glowing, and alive.
            </p>
          </div>

          {/* NEW blocks for pride and power */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-purple-600 transition">
            <h2 className="text-2xl mb-2">🛠️ Because We Built Nepal — Literally</h2>
            <p className="text-sm text-gray-300">
              Every carved strut in Patan, every brick of Bhaktapur, every celestial mandala in Kathmandu —  
              was laid by Newar hands. We are the architects of Nepal’s sacred geometry.  
              The builders of palaces, temples, and time itself.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-purple-600 transition">
            <h2 className="text-2xl mb-2">🧱 Because We Measured Time in Stone</h2>
            <p className="text-sm text-gray-300">
              Our calendar — Nepal Sambat — outlives kings and empires.  
              We marked time not with wars, but with festivals, rituals, and sacred continuity.  
              PasaGuthi honors that rhythm.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-purple-600 transition">
            <h2 className="text-2xl mb-2">🔱 Because We Protected Dharma with Tools, Not Swords</h2>
            <p className="text-sm text-gray-300">
              While others conquered with armies, Newars safeguarded culture through sculpture, urban design, and sacred rites.  
              Our legacy is not conquest — it is continuity. Not destruction — but design.
            </p>
          </div>
        </div>

        <p className="mt-16 text-purple-400 text-md italic">
          “To forget Guthi is to forget who we are.  
          PasaGuthi is not built. It is remembered.”
        </p>
      </div>
    </>
  );
}
