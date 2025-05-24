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

const Box = ({ title, emoji, children }) => (
  <motion.div
    className="bg-gray-800 rounded-xl p-6 transition text-sm text-gray-300"
    variants={glowVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.4 }}
  >
    <h2 className="text-2xl mb-2">{emoji} {title}</h2>
    <p>{children}</p>
  </motion.div>
);

export default function WhyPasaguthi() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Why Pasaguthi? — Sacred Return",
    "url": "https://www.pasaguthi.org/why",
    "description": "Discover why Pasaguthi exists — to reawaken the soul of Newar civilization through digital Guthi revival, sacred architecture, and ancestral DAO principles.",
    "about": {
      "@type": "Thing",
      "name": "Guthi",
      "description": "A traditional Newar cooperative system that functions like a DAO for cultural and spiritual continuity."
    }
  };

  return (
    <>
      <Head>
        <title>Why Pasaguthi? — Sacred Return</title>
        <meta name="description" content="Discover why Pasaguthi exists — to reawaken the soul of Newar civilization through digital Guthi revival, sacred architecture, and ancestral DAO principles." />
        <meta property="og:title" content="Why Pasaguthi? — Sacred Return" />
        <meta property="og:description" content="Pasaguthi is a sacred remembering — a revival of Guthi as a DAO, rooted in heritage and designed for the future." />
        <meta property="og:url" content="https://www.pasaguthi.org/why" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-gray-900 text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-6">✨ Why Pasaguthi?</h1>
        <p className="text-lg max-w-2xl mx-auto text-purple-300 mb-12">
          Pasaguthi is not just a platform. It is a sacred remembering.  
          A return to what our ancestors knew:  
          🧬 <em>Guthi is the soul of a civilization.</em>
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
          <Box title="Because We Were Never Just a Caste" emoji="🌿">
            Newars are not just an ethnicity — we are a living archive.  
            Artisans, priests, farmers, traders, warriors, mystics.  
            Our diversity is our design.
          </Box>

          <Box title="Because Guthi Is the Original DAO" emoji="🪔">
            Long before Web3, we shared land, memory, and responsibility  
            through sacred cooperatives.  
            Pasaguthi brings that back — not with tech hype, but soul alignment.
          </Box>

          <Box title="Because Scattered Threads Must Reweave" emoji="🌀">
            Newars are now everywhere — Boston, Berlin, Bhaktapur.  
            But our digital heart was missing. Until now.  
            Pasaguthi reconnects us — name, Thar, karma, purpose.
          </Box>

          <Box title="Because The Future Needs Roots" emoji="☀️">
            Our children need more than screens.  
            They need identity, rhythm, belonging, and myth.  
            Pasaguthi is their compass — grounded, glowing, and alive.
          </Box>

          <Box title="Because We Built Nepal — Literally" emoji="🛠️">
            Every carved strut in Patan, every brick of Bhaktapur, every celestial mandala in Kathmandu —  
            was laid by Newar hands. We are the architects of Nepal’s sacred geometry.  
            The builders of palaces, temples, and time itself.
          </Box>

          <Box title="Because We Measured Time in Stone" emoji="🧱">
            Our calendar — Nepal Sambat — outlives kings and empires.  
            We marked time not with wars, but with festivals, rituals, and sacred continuity.  
            Pasaguthi honors that rhythm.
          </Box>

          <Box title="Because We Protected Dharma with Tools, Not Swords" emoji="🔱">
            While others conquered with armies, Newars safeguarded culture through sculpture, urban design, and sacred rites.  
            Our legacy is not conquest — it is continuity. Not destruction — but design.
          </Box>
        </div>

        <p className="mt-16 text-purple-400 text-md italic">
          “To forget Guthi is to forget who we are.  
          Pasaguthi is not built. It is remembered.”
        </p>
      </div>
    </>
  );
}
