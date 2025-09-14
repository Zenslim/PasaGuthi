// pages/_app.jsx
import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';            // ✨ add
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Load lightweight local identity (GuthiKey) for header UX
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('guthiKey');
      const name = localStorage.getItem('userName');
      if (key) setUser({ key, name: name || '' });
    }
  }, []);

  // Guard selected routes
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

  // Keep header state in sync on navigation
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
      <Footer />
      {/* Global toast portal */}
      <Toaster position="top-center" toastOptions={{
        style: { background: '#0b0b0b', color: '#fff', border: '1px solid #27272a' }
      }} />
    </>
  );
}

export default MyApp;
