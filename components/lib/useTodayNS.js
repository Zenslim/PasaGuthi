import { useEffect, useState } from 'react';
import { resolveTodayNS } from './resolveTodayNS';

export function useTodayNS() {
  const [todayNS, setTodayNS] = useState(null);

  useEffect(() => {
    const data = resolveTodayNS();
    setTodayNS(data);
  }, []);

  return todayNS;
}