
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { handlePostSignIn } from '../lib/handlePostSignIn';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export default function SignIn() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const redirect = await handlePostSignIn(user);
        router.push(redirect.redirect);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const redirect = await handlePostSignIn(result.user);
      router.push(redirect.redirect);
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert("Something went wrong with Google sign-in.");
    }
  };

  const handleFacebookSignIn = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const redirect = await handlePostSignIn(result.user);
      router.push(redirect.redirect);
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      alert("Something went wrong with Facebook sign-in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-white p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-purple-800">🔐 Sign in to the Guthi</h1>
        <p className="text-sm text-gray-500">🌐 One Heritage. Many Homes. Infinite Connections.</p>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center space-x-2 border border-gray-300 bg-white text-gray-800 rounded-md py-2 hover:bg-gray-50 transition font-medium"
        >
          <FcGoogle className="text-xl" />
          <span>Sign in with Google</span>
        </button>

        <button
          onClick={handleFacebookSignIn}
          className="w-full flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 rounded-md py-2 hover:bg-blue-50 transition font-medium"
        >
          <FaFacebook className="text-xl" />
          <span>Sign in with Facebook</span>
        </button>
      </div>
    </div>
  );
}
