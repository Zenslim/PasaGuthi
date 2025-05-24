import Head from 'next/head';

export default function Vision() {
  return (
    <>
      <Head>
        <title>Vision — Where Are We Going?</title>
        <meta name="description" content="Pasaguthi envisions healing gardens, digital temples, and a DAO for cultural revival across the Newar world." />
        <meta property="og:title" content="Vision — Where Are We Going?" />
        <meta property="og:description" content="Pasaguthi envisions healing gardens, digital temples, and a DAO for cultural revival across the Newar world." />
        <meta property="og:url" content="https://www.pasaguthi.org/vision" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.pasaguthi.org/vision" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={ {
            __html: JSON.stringify({'@context': 'https://schema.org', '@type': 'WebPage', 'name': 'Vision', 'url': 'https://www.pasaguthi.org/vision', 'description': 'Pasaguthi envisions healing gardens, digital temples, and a DAO for cultural revival across the Newar world.'})
          } }
        />
    
        <title>Vision — Where Are We Going?</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-black text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-6">🔭 Vision</h1>
        <p className="text-lg max-w-2xl mx-auto text-indigo-300 mb-12">
          Pasaguthi is not just for today. It is for the next 100 years.  
          We dream big — with our feet in the soil and our heart in the stars.
        </p>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto text-left">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-600 transition">
            <h2 className="text-xl font-semibold mb-2">🌱 Healing Gardens</h2>
            <p className="text-sm text-gray-300">
              Every community should have a place to rest, grow food, and heal.  
              We dream of sacred gardens across Nepal and the world.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-600 transition">
            <h2 className="text-xl font-semibold mb-2">🏛️ Digital Temples</h2>
            <p className="text-sm text-gray-300">
              Our festivals, songs, and stories will live online too.  
              We build sacred spaces you can enter from anywhere — even from a phone.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-600 transition">
            <h2 className="text-xl font-semibold mb-2">🕸️ DAO for Newars</h2>
            <p className="text-sm text-gray-300">
              Pasaguthi will become a DAO — a digital cooperative.  
              Together, we vote, build, share, and support each other as equals.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-600 transition">
            <h2 className="text-xl font-semibold mb-2">🧭 Compass for Youth</h2>
            <p className="text-sm text-gray-300">
              We will build tools to help young Newars find their purpose,  
              follow their dreams, and stay rooted in their culture.
            </p>
          </div>
        </div>

        <p className="mt-16 text-indigo-400 text-sm italic">
          “A real vision is not seen with the eyes. It is felt with the ancestors.”
        </p>
      </div>
    </>
  );
}
