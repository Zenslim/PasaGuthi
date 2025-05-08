import { useEffect, useState } from 'react';
import UnifiedProfileCard from '../../components/UnifiedProfileCard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function GuildPage() {
  const [data, setData] = useState([]);
  useEffect(() => {
    setData([{ name: 'Sample Member', skill: 'Wisdom' }]);
  }, []);

  return (
    <div>
      <Navbar />
      <main className="p-4">
        {data.map((d, i) => (
          <UnifiedProfileCard key={i} user={d} />
        ))}
      </main>
      <Footer />
    </div>
  );
}
