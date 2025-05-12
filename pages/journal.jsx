import Head from 'next/head';
import Link from 'next/link';

export default function RevivalJournal() {
  return (
    <>
      <Head>
        <title>Revival Journal — The Echoes Within</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-purple-900 text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-6">🕰️ Revival Journal</h1>
        <p className="text-lg max-w-2xl mx-auto text-purple-300 mb-12">
          Pasaguthi is not just made of users. It is made of whispers.  
          Every voice that reflects — nourishes the DAO.  
          This is our growing forest of remembrance.
        </p>

        <div className="max-w-3xl mx-auto grid gap-8">
          <div className="bg-gray-800 rounded-xl p-6 text-left shadow-lg hover:shadow-purple-600 transition">
            <h2 className="text-xl font-semibold mb-2">✨ What Is a Whisper?</h2>
            <p className="text-sm text-gray-300">
              A whisper is not a post.  
              It is a sacred reflection:  
              a feeling, a memory, a longing, a vow.  
              You leave it anonymously — but it echoes forever.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 text-left shadow-lg hover:shadow-purple-600 transition">
            <h2 className="text-xl font-semibold mb-2">🧘 Why Journal Here?</h2>
            <p className="text-sm text-gray-300">
              Because your story matters. Because your pain is sacred.  
              Because your joy, too, deserves to be witnessed.  
              And because the community learns from your truth.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
            <Link
              href="/whisper"
              className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-3 rounded-xl text-lg shadow-lg transition"
            >
              🪔 Start a Whisper
            </Link>
            <Link
              href="/timeline"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl text-lg shadow-lg transition"
            >
              📜 View Past Whispers
            </Link>
          </div>
        </div>

        <p className="mt-16 text-purple-400 text-sm italic">
          “You are not writing for likes.  
          You are writing to awaken the Guthi inside you.”
        </p>
      </div>
    </>
  );
}
