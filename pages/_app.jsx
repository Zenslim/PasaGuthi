
import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import NavBar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('guthiKey');
      const name = localStorage.getItem('userName');
      if (key) setUser({ key, name: name || '' });
    }
  }, []);

  useEffect(() => {
    const protectedPaths = ['/dashboard', '/grove/ritual'];
    const handleRouteChange = (url) => {
      const path = url.split('?')[0];
      const hasKey = localStorage.getItem('guthiKey');
      if (protectedPaths.includes(path) && !hasKey) {
        router.replace('/signin');
      }
    };
    handleRouteChange(router.pathname);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  useEffect(() => {
    const handleComplete = () => {
      const key = localStorage.getItem('guthiKey');
      const name = localStorage.getItem('userName');
      if (key) setUser({ key, name: name || '' });
      else setUser(null);
    };
    router.events.on('routeChangeComplete', handleComplete);
    return () => router.events.off('routeChangeComplete', handleComplete);
  }, [router]);

  return (
    <>
      <NavBar user={user} />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
