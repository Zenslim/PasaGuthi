import Head from 'next/head';
import { motion } from 'framer-motion';

const glowVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)',
    transition: { duration: 0.6 }
  }
};

const Box = ({ emoji, title, children }) => (
  <motion.div
    className="bg-gray-800 rounded-xl p-6 text-sm text-gray-300"
    variants={glowVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.4 }}
  >
    <h2 className="text-2xl mb-2">{emoji} {title}</h2>
    <p>{children}</p>
  </motion.div>
);

export default function Guthi() {
  return (
    <>
      <Head>
        <title>What Is Guthi? — Sacred DAO for Wholeness</title>
      </Head>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-gray-900 text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-6">✨ What Is Guthi?</h1>
        <p className="text-lg max-w-2xl mx-auto text-purple-300 mb-12">
          Guthi is not just a key — it is a remembrance of sacred order.  
          A living system for healing, belonging, and soul-powered regeneration.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
          <Box emoji="🔱" title="Because Guthi Is the Original DAO">
            Long before blockchains, our ancestors distributed land, roles, and karma  
            through sacred vows and shared rituals. Guthi is decentralized. Sacred. Trustless — but soul-bound.
          </Box>

          <Box emoji="🧬" title="Because It Heals BPSS — Bio, Psycho, Social, Spiritual">
            True health is not just physical. Guthi was designed to heal your breath, thoughts, relationships, and purpose.  
            Pasaguthi reawakens that model — one presence at a time.
          </Box>

          <Box emoji="🪔" title="Because It Is the Architecture of Belonging">
            From festivals to funerals, every sacred act was held by Guthi.  
            No one was alone. No moment was random. This is ancestral UX — intuitive, meaningful, complete.
          </Box>

          <Box emoji="🌱" title="Because Ikigai Needs Roots">
            Purpose is not a luxury. It is survival.  
            Guthi doesn’t ask ‘What do you do?’ It asks ‘Why were you born here, now, among us?’
          </Box>

          <Box emoji="🌀" title="Because Scattered Souls Need a System">
            Diaspora, depression, burnout — all are symptoms of disconnection.  
            Guthi is the reconnection protocol. Not an app. A memory system for your soul.
          </Box>

          <Box emoji="🎴" title="Because Culture Is a Sacred Operating System">
            Guthi encoded language, ritual, service, and celebration.  
            It is not outdated — it is encrypted. Pasaguthi is the decryption key.
          </Box>
        </div>

        <p className="mt-16 text-purple-400 text-md italic">
          “Your Guthi key is not something you receive.  
          It is something you remember.”
        </p>
      </main>
      <Footer />
    </>
  );
}
