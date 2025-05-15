import Head from 'next/head';
import { motion } from 'framer-motion';

const glowVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)', // purple glow
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
  return (
    <>
      <Head>
        <title>Why Pasaguthi? — Sacred Return</title>
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
            Newars are not just an ethnicity, we are a living archive.  
            Artisans, priests, farmers, traders, warriors, mystics.  
            Our diversity is our design.
          </Box>

          <Box title="Because Guthi Is the Original DAO" emoji="🪔">
            Long before Web3, we shared land, memory, and responsibility  
            through sacred cooperatives.  
            Pasaguthi brings that back not with tech hype, but soul alignment.
          </Box>

         <Box title="Because Scattered Threads Must Reweave" emoji="🌀">
  Newars are now everywhere — Boston, Berlin, Bhaktapur.  
  But something sacred was missing: a way to feel each other again.  
  Pasaguthi brings us back to our name, our Thar, our story, our purpose.  
  No matter where we go, we still belong to the same thread.
</Box>


          <Box title="Because The Future Needs Roots" emoji="☀️">
            Our children need more than screens.  
            They need identity, rhythm, belonging, and myth.  
            Pasaguthi is their compass grounded, glowing, and alive.
          </Box>

          <Box title="Because We Built Nepal — Literally" emoji="🛠️">
            Every carved strut in Patan, every brick of Bhaktapur, every celestial mandala in Kathmandu  
            was laid by Newar hands. We are the architects of Nepal’s sacred geometry.  
            The builders of palaces, temples, and time itself.
          </Box>

          <Box title="Because We Measured Time in Stone" emoji="🧱">
            Our calendar, Nepal Sambat outlives kings and empires.  
            We marked time not with wars, but with festivals, rituals, and sacred continuity.  
            Pasaguthi honors that rhythm.
          </Box>

          <Box title="Because We Protected Dharma with Tools, Not Swords" emoji="🔱">
            While others conquered with armies, Newars safeguarded culture through sculpture, urban design, and sacred rites.  
            Our legacy is not conquest, it is continuity. Not destruction, but design.
          </Box>
       
<Box title="Because We Are More Than Survival" emoji="🧭">
  Pasaguthi is not a system to trap you, it is a memory to set you free.
From the hunger of the body to the quiet ache of the soul, every layer of your being is seen, honored, and nourished.

  <div className="mt-4 space-y-2 text-purple-200">
    <div>🏡 We remember how to grow food as ritual, not commodity.</div>
    <div>🛡️ We protect each other not with walls, but with presence.</div>
    <div>🤝 We belong not by proving, but by remembering who we are.</div>
    <div>🪷 We rise not by status, but by offering our sacred skill.</div>
    <div>🌿 We seek true health where body, mind, heart, and spirit are in balance, and purpose flows from within.</div>
  </div>

  <p className="mt-6">
    You are not a number. You are not alone.  
    Pasaguthi gives you back to yourself with roots deep enough to hold you,  
    and wings wide enough to set you free.
  </p>
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
