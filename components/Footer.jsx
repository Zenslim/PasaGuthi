
import Link from 'next/link';

export default function Footer() {
  const supportLinks = [
    { emoji: '🔭', label: 'Vision', href: '/vision' },
    { emoji: '📖', label: 'How It Works', href: '/how' },
    { emoji: '🕰️', label: 'Revival Journal', href: '/journal' },
    { emoji: '🌍', label: 'Diaspora Stories', href: '/diaspora' },
    { emoji: '❓', label: 'Questions', href: '/faq' },
  ];

  return (
    <footer className="bg-black text-white text-center px-4 py-6">
      <p className="text-sm font-medium">© 2025 Pasaguthi DAO</p>
      <p className="text-sm text-purple-400 mb-4">
        One Heritage. Many Homes. Infinite Connections.
      </p>

      <div className="hidden md:flex justify-center flex-wrap gap-6 text-sm">
        {supportLinks.map(({ emoji, label, href }) => (
          <Link
            key={href}
            href={href}
            className="hover:text-purple-300 transition-colors"
          >
            {emoji} {label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
