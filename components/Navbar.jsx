
import Link from 'next/link';
import { useRouter } from 'next/router';

function NavBar({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guthiKey');
      localStorage.removeItem('userName');
    }
    router.push('/signin');
  };

  return (
    <nav className="w-full flex justify-between items-center px-4 py-3 bg-gray-900 text-gray-100">
      <Link href="/" className="font-semibold text-lg">
        PasaGuthi
      </Link>
      <div>
        {user ? (
          <>
            <Link href="/dashboard" className="mr-4 hover:underline">
              👤 {user.name ? user.name : 'Profile'}
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
  );
}

export default NavBar;
