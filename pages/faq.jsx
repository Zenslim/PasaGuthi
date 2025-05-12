import Head from 'next/head';

export default function FAQ() {
  return (
    <>
      <Head>
        <title>Questions — Pasaguthi FAQ</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-6">❓ Questions You Carry</h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-300 mb-12">
          These are not just FAQs.  
          These are the gentle answers to the quiet questions in your heart.
        </p>

        <div className="max-w-3xl mx-auto space-y-8 text-left">

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🔐 Do I need to sign in to use Pasaguthi?</h2>
            <p className="text-sm text-gray-300">
              No. You can read stories, see others, and explore freely.  
              But if you want to whisper, earn karma, or join projects — yes, you need a Guthi Key.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🧬 What is a Guthi Key?</h2>
            <p className="text-sm text-gray-300">
              It is your digital identity in our network.  
              It includes your name, Thar (family name), skills, and region.  
              You get it once — like a blessing.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🪔 What is a Whisper?</h2>
            <p className="text-sm text-gray-300">
              A whisper is a small message from your heart — a thought, a memory, a vow.  
              It helps you reflect and also helps the community grow.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">📜 What is Karma?</h2>
            <p className="text-sm text-gray-300">
              Karma is not money. It is love in action.  
              You earn it by writing, helping, creating, or participating.  
              The more karma, the more trusted you are in the Guthi.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🌏 I live outside Nepal. Can I still join?</h2>
            <p className="text-sm text-gray-300">
              Of course. Pasaguthi is made for the global Newar family.  
              Whether you are in New York or Newroad, you are home here.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">👥 Who runs Pasaguthi?</h2>
            <p className="text-sm text-gray-300">
              It is run by a growing circle of Newars — artists, coders, farmers, priests, mothers, and dreamers.  
              Soon it will become a DAO — a Guthi that governs itself.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🌸 What if I don’t know my Thar?</h2>
            <p className="text-sm text-gray-300">
              That’s okay. We will help you find it gently.  
              Your story matters even if the past is unclear.
            </p>
          </div>

        </div>

        <p className="mt-16 text-purple-400 text-sm italic">
          “A question is not a doubt. It is a doorway.”  
          If your question is not listed, whisper it to us. We will listen.
        </p>
      </div>
    </>
  );
}
