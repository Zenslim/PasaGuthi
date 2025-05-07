import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar({ dark = false }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const baseClass = dark
    ? 'bg-black text-white'
    : 'bg-white text-black shadow';

  return (
    <nav className={`w-full ${baseClass} fixed top-0 z-50 transition-all`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
       <Link href="/" className="flex items-center group cursor-pointer">
  <h1
    className={`text-2xl font-extrabold tracking-wide ${
      dark ? 'text-white' : 'text-gray-800'
    }`}
  >
    <span className="text-yellow-400 group-hover:animate-pulse transition duration-300 ease-in-out">
      Pasa
    </span>
    <span className="text-purple-500 group-hover:text-purple-300 transition duration-300 ease-in-out">
      Guthi
    </span>
  </h1>
</Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/network" className="hover:text-purple-400 transition">
            Network
          </Link>
          <Link href="/dashboard" className="hover:text-purple-400 transition">
            Dashboard
          </Link>
          <Link href="/whisper">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow transition">
              ✨ Whisper
            </button>
          </Link>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl focus:outline-none"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className={`md:hidden ${dark ? 'bg-black' : 'bg-white'} px-6 py-4 space-y-4`}>
          <Link href="/network" onClick={() => setMenuOpen(false)} className="block text-lg hover:text-purple-400 transition">
            Network
          </Link>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-lg hover:text-purple-400 transition">
            Dashboard
          </Link>
          <Link href="/whisper" onClick={() => setMenuOpen(false)}>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition">
              ✨ Whisper
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
