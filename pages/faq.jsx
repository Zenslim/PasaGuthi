import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaLock, FaUserFriends, FaFire, FaKey, FaFeather, FaProjectDiagram, FaEnvelopeOpenText, FaSeedling, FaUsers, FaPrayingHands, FaQuestion } from 'react-icons/fa';

const faqData = [
  { icon: <FaLock />, emoji: "🔐", id: "sign-in", q: "Do I need to sign in to use PasaGuthi?", a: "No. You are free to explore. But to whisper, reflect, earn karma, or join projects — you’ll need a Guthi Key." },
  { icon: <FaUserFriends />, emoji: "🇳🇵", id: "nepal", q: "Is Pasaguthi trying to make Nepal great again?", a: "Yes — but not by politics or pride. By reawakening what made Nepal great in the first place: the Guthi spirit of cooperation, beauty, mutual aid, and cultural brilliance. When Newars unite, Nepal remembers itself." },
  { icon: <FaFire />, emoji: "🔥", id: "newars", q: "Is this just for Newars?", a: "It is rooted in Newar culture — but open to all who walk with respect, love, and curiosity. Like any temple: it has a guardian door, but the fire inside can warm the whole village." },
  { icon: <FaKey />, emoji: "🧬", id: "guthi-key", q: "What is a Guthi Key?", a: "It is your sacred digital identity. It holds your name, Thar, region, and karma. It is not a password. It is a promise to belong." },
  { icon: <FaFeather />, emoji: "🪔", id: "whisper", q: "What is a Whisper?", a: "A whisper is a reflection — a short message from your heart. You can write joy, grief, questions, or visions. Each whisper nourishes the Guthi." },
  { icon: <FaProjectDiagram />, emoji: "🕸️", id: "dao", q: "What is a DAO?", a: "DAO means Decentralized Autonomous Organization. But for us, it means Digital Ancestral Order. Like old Guthis, but powered by tech. Everyone has a voice. Decisions are made together — not by a boss." },
  { icon: <FaEnvelopeOpenText />, emoji: "📮", id: "contact", q: "Why is there no contact form or help email?", a: "Because PasaGuthi is not a service. It is a circle. Your questions become whispers. Your participation brings clarity. Instead of contacting, you contribute — and the Guthi responds." },
  { icon: <FaSeedling />, emoji: "🌾", id: "contribute", q: "What if I don’t contribute? Will I be excluded?", a: "No one is pushed out. But those who give will unlock more. In our culture, silence is honored — but offering is sacred." },
  { icon: <FaUsers />, emoji: "👥", id: "team", q: "Who runs PasaGuthi?", a: "A small team of Newars started it. But soon, the DAO will take over. It will be run by the community — not by a company." },
  { icon: <FaPrayingHands />, emoji: "🧘", id: "spiritual", q: "Is this religious or spiritual?", a: "It is cultural. It honors our gods, festivals, and ancestors. But it welcomes all kinds of belief — or even questions." },
  { icon: <FaQuestion />, emoji: "🤔", id: "forme", q: "Is this really for me?", a: "If you feel Newar in your bones, if you’ve longed to belong, if you’ve felt forgotten by the systems of the world — then yes, PasaGuthi is for you." }
];

export default function FAQ() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(f => ({
      "@type": "Question",
      "name": `${f.emoji} ${f.q}`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <>
      <Head>
        <title>FAQ | Pasaguthi – Reviving the Living Guthi DAO</title>
        <meta name="description" content="Answers to the most profound questions about Pasaguthi, the Guthi Key, whispers, DAO, cultural belonging, and more." />
        <meta property="og:title" content="Pasaguthi FAQ – Questions You Carry" />
        <meta property="og:description" content="These are not just FAQs. These are quiet questions in your heart — and the gentle answers we carry together." />
        <meta property="og:url" content="https://www.pasaguthi.org/faq" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-6">❓ Questions You Carry</h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-300 mb-12">
          These are not just FAQs. These are the quiet questions in your heart — and the gentle answers we carry together.
        </p>

        <div className="max-w-3xl mx-auto space-y-10 text-left">
          {faqData.map(({ q, a, icon, id, emoji }, i) => (
            <motion.div key={i} id={id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h2 className="text-xl font-semibold text-purple-300 mb-2 flex items-center gap-2">{icon} {emoji} {q}</h2>
              <p className="text-sm text-gray-300">{a}</p>
              {(i === 4 || i === 8) && (
                <p className="text-center mt-6 text-purple-400 italic">
                  🕊️ Still wondering? <a href="/whisper" className="underline">Leave a Whisper</a>
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <p className="mt-16 text-purple-400 text-sm italic">
          “Some answers are not given. They are lived.” If your question remains — leave a whisper.
        </p>
      </div>
    </>
  );
}
