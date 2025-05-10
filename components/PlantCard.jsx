// components/PlantCard.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function PlantCard({ user, onClick }) {
  const [growthStage, setGrowthStage] = useState('seedling');

  useEffect(() => {
    if (user.karma > 100) setGrowthStage('bloom');
    else if (user.karma > 50) setGrowthStage('sprout');
    else setGrowthStage('seedling');
  }, [user.karma]);

  const stageStyles = {
    seedling: 'bg-green-300 animate-pulse',
    sprout: 'bg-green-500 animate-bounce',
    bloom: 'bg-pink-400 animate-spin'
  };

  return (
    <motion.div
      className={`w-20 h-20 rounded-full shadow-md cursor-pointer ${stageStyles[growthStage]} flex items-center justify-center`}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
    >
      <span className="text-xs text-white font-semibold text-center px-1">
        {user.name || 'Seeker'}
      </span>
    </motion.div>
  );
}
