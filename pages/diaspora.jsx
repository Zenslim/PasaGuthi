import Head from 'next/head';

export default function DiasporaStories() {
  return (
    <>
      <Head>
        <title>Diaspora Stories — Newars Around the World</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-6">🌍 Diaspora Stories</h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-300 mb-12">
          Our people are everywhere — in Boston, Berlin, Bhutan, and Bhaktapur.  
          But no matter how far we go, our hearts remember the smell of home.  
          Pasaguthi is here to reconnect us.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-blue-600 transition">
            <h2 className="text-xl font-semibold mb-2">🗺️ Why Diaspora?</h2>
            <p className="text-sm text-gray-300">
              Some went to study. Some to work. Some to escape.  
              But wherever we go, we carry our language, our faith, our food.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-blue-600 transition">
            <h2 className="text-xl font-semibold mb-2">📍 Stay Connected</h2>
            <p className="text-sm text-gray-300">
              Through Pasaguthi, you can see others near you.  
              Join local chapters. Share your story. You are not forgotten.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-blue-600 transition">
            <h2 className="text-xl font-semibold mb-2">🎤 Share Your Journey</h2>
            <p className="text-sm text-gray-300">
              What was hard? What gave you strength?  
              Your story can guide others who feel alone.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-blue-600 transition">
            <h2 className="text-xl font-semibold mb-2">👶 Teach the Young</h2>
            <p className="text-sm text-gray-300">
              Teach your children to say “Namaste” and “Jwojolappa.”  
              Teach them to honor ancestors. This is how our light survives.
            </p>
          </div>
        </div>

        <p className="mt-16 text-blue-400 text-sm italic">
          “You may live far from Nepal. But the Guthi lives inside you.”  
        </p>
      </div>
    </>
  );
}
