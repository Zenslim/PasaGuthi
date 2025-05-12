
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavBar({ user }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guthiKey');
      localStorage.removeItem('userName');
    }
    router.push('/signin');
  };

  const coreLinks = [
    { emoji: '✨', label: 'Why Pasaguthi?', href: '/why' },
    { emoji: '🧬', label: 'What is Guthi?', href: '/guthi' },
    { emoji: '🌿', label: 'View our Guthyars', href: '/guthyars' },
    { emoji: '📆', label: 'Nepal Sambat', href: '/nepalsambat' },
    { emoji: '🪔', label: 'Whisper', href: '/whisper' },
    { emoji: '☀️', label: 'Join the Circle', href: '/welcome' },
  ];

  const supportLinks = [
    { emoji: '🔭', label: 'Vision', href: '/vision' },
    { emoji: '📖', label: 'How It Works', href: '/how' },
    { emoji: '🕰️', label: 'Revival Journal', href: '/journal' },
    { emoji: '🌍', label: 'Diaspora Stories', href: '/diaspora' },
    { emoji: '❓', label: 'Questions', href: '/faq' },
  ];

  return (
    <>
      <nav className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 text-white shadow-md">
        <button
          className="text-2xl mr-3 focus:outline-none"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        <Link href="/" className="font-bold text-lg tracking-wide">
          PasaGuthi
        </Link>
        <div>
          {user ? (
            <>
              <Link href="/dashboard" className="mr-4 hover:underline">
                👤 {user.name || 'Profile'}
              </Link>
              <button onClick={handleLogout} className="hover:underline">
                🚪 Logout
              </button>
            </>
          ) : (
            <Link href="/signin" className="hover:underline">
              🔐 Sign In
            </Link>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 h-full w-72 bg-white text-gray-900 shadow-lg z-50"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-5 border-b font-bold text-xl">🌸 Menu</div>
              <ul className="p-4 space-y-4">
                {coreLinks.map(({ emoji, label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="block text-lg hover:text-purple-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      {emoji} {label}
                    </Link>
                  </li>
                ))}
                <hr className="my-4 border-gray-300" />
                {supportLinks.map(({ emoji, label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="block text-base text-gray-700 hover:text-indigo-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      {emoji} {label}
                    </Link>
                  </li>
                ))}
                <li className="pt-6 border-t">
                  {user ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="text-base w-full text-left hover:text-red-500"
                    >
                      🚪 Logout
                    </button>
                  ) : (
                    <Link
                      href="/signin"
                      className="text-base block hover:text-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      🔐 Sign In
                    </Link>
                  )}
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
