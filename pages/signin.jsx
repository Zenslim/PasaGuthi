import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export default function SignIn() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/dashboard');
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert("Something went wrong with Google sign-in.");
    }
  };

  const handleFacebookSignIn = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      alert("Something went wrong with Facebook sign-in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-white p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-purple-800 leading-snug">
          🌐 One Heritage. <br />
          Many Homes. <br />
          <span className="text-indigo-700">Infinite Connections.</span>
        </h1>

        <p className="text-sm text-gray-500">Sign in to awaken your Guthi connection</p>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center space-x-2 border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition"
        >
          <FcGoogle className="text-xl" />
          <span>Sign in with Google</span>
        </button>

        <button
          onClick={handleFacebookSignIn}
          className="w-full flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 rounded-md py-2 hover:bg-blue-50 transition"
        >
          <FaFacebook className="text-xl" />
          <span>Sign in with Facebook</span>
        </button>
      </div>
    </div>
  );
}
