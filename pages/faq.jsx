import Head from 'next/head';

export default function FAQ() {
  return (
    <>
      <Head>
        <title>Questions — PasaGuthi FAQ</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-6">❓ Questions You Carry</h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-300 mb-12">
          These are not just FAQs.  
          These are the quiet questions in your heart — and the gentle answers we carry together.
        </p>

        <div className="max-w-3xl mx-auto space-y-8 text-left">

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🔐 Do I need to sign in to use PasaGuthi?</h2>
            <p className="text-sm text-gray-300">
              No. You are free to explore. But to whisper, reflect, earn karma, or join projects — you’ll need a Guthi Key.
            </p>
          </div>

         <div>
  <h2 className="text-xl font-semibold text-purple-300 mb-2">🇳🇵 Is PasaGuthi trying to make Nepal great again?</h2>
  <p className="text-sm text-gray-300">
    Yes — but not by politics or pride. By **reawakening what made Nepal great in the first place**:  
    the Guthi spirit of cooperation, beauty, mutual aid, and cultural brilliance.  
    When Newars unite, Nepal remembers itself.
  </p>
</div>

<div>
  <h2 className="text-xl font-semibold text-purple-300 mb-2">🔥 Is this just for Newars?</h2>
  <p className="text-sm text-gray-300">
    It is rooted in Newar culture — but open to all who walk with respect, love, and curiosity.  
    Like any temple: it has a guardian door, but the fire inside can warm the whole village.
  </p>
</div>
 <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🧬 What is a Guthi Key?</h2>
            <p className="text-sm text-gray-300">
              It is your sacred digital identity. It holds your name, Thar, region, and karma.  
              It is not a password. It is a promise to belong.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🪔 What is a Whisper?</h2>
            <p className="text-sm text-gray-300">
              A whisper is a reflection — a short message from your heart.  
              You can write joy, grief, questions, or visions.  
              Each whisper nourishes the Guthi.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🕸️ What is a DAO?</h2>
            <p className="text-sm text-gray-300">
              DAO means *Decentralized Autonomous Organization*.  
              But for us, it means **Digital Ancestral Order**.  
              Like old Guthis, but powered by tech.  
              Everyone has a voice. Decisions are made together — not by a boss.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">📮 Why is there no contact form or help email?</h2>
            <p className="text-sm text-gray-300">
              Because PasaGuthi is not a service. It is a circle.  
              Your questions become whispers. Your participation brings clarity.  
              Instead of contacting, you contribute — and the Guthi responds.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🌾 What if I don’t contribute? Will I be excluded?</h2>
            <p className="text-sm text-gray-300">
              No one is pushed out. But those who give will unlock more.  
              In our culture, silence is honored — but offering is sacred.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">👥 Who runs PasaGuthi?</h2>
            <p className="text-sm text-gray-300">
              A small team of Newars started it. But soon, the DAO will take over.  
              It will be run by the community — not by a company.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🧘 Is this religious or spiritual?</h2>
            <p className="text-sm text-gray-300">
              It is cultural. It honors our gods, festivals, and ancestors.  
              But it welcomes all kinds of belief — or even questions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-300 mb-2">🤔 Is this really for me?</h2>
            <p className="text-sm text-gray-300">
              If you feel Newar in your bones, if you’ve longed to belong,  
              if you’ve felt forgotten by the systems of the world —  
              then yes, PasaGuthi is for you.
            </p>
          </div>

        </div>

        <p className="mt-16 text-purple-400 text-sm italic">
          “Some answers are not given. They are lived.”  
          If your question remains — leave a whisper.
        </p>
      </div>
    </>
  );
}
