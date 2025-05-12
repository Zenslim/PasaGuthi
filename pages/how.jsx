import Head from 'next/head';

export default function HowPasaguthi() {
  return (
    <>
      <Head>
        <title>How Pasaguthi Works — Flow of Belonging</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-6">📖 How Pasaguthi Works</h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-300 mb-12">
          Pasaguthi is a sacred flow — from identity to offering, from reflection to rebirth.  
          Here's how you move within the Guthi web.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-600 transition">
            <h2 className="text-xl font-semibold mb-2">🧬 Claim Your Guthi Key</h2>
            <p className="text-sm text-gray-300">
              Begin your journey by naming yourself:  
              your Thar, your region, your sacred skills.  
              This becomes your digital Guthi identity.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-600 transition">
            <h2 className="text-xl font-semibold mb-2">🌿 Meet Other Guthyars</h2>
            <p className="text-sm text-gray-300">
              Explore our living map of Newars across the world.  
              Discover kindred threads. See who walks beside you.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-600 transition">
            <h2 className="text-xl font-semibold mb-2">🪔 Whisper into the Circle</h2>
            <p className="text-sm text-gray-300">
              Leave a reflection. A prayer. A poem. A vow.  
              Each whisper adds karma. Each voice activates the DAO.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-600 transition">
            <h2 className="text-xl font-semibold mb-2">🌀 Earn and Offer Karma</h2>
            <p className="text-sm text-gray-300">
              Karma is not money. It is attention + action.  
              You earn it by participating. You offer it to build.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-600 transition">
            <h2 className="text-xl font-semibold mb-2">🌍 Join Diaspora Rituals</h2>
            <p className="text-sm text-gray-300">
              Whether in Patan or Paris, Pasaguthi invites you  
              into seasonal festivals and shared remembrance.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-600 transition">
            <h2 className="text-xl font-semibold mb-2">☀️ Step Into Sacred Projects</h2>
            <p className="text-sm text-gray-300">
              From healing gardens to digital temples,  
              Pasaguthi is a portal for service + sovereignty.
            </p>
          </div>
        </div>

        <p className="mt-16 text-indigo-400 text-md italic">
          “You do not join Pasaguthi. You remember it.”  
        </p>
      </div>
    </>
  );
}
