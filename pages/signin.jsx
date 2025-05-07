
import { useRouter } from 'next/router';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { handlePostSignIn } from '../lib/firestore';

export default function SignInPage() {
  const router = useRouter();

  const signIn = async (providerType) => {
    const provider = providerType === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const redirect = await handlePostSignIn(result.user);
      router.push(redirect.redirect);
    } catch (err) {
      console.error("Sign-in error:", err);
      alert("Something went wrong during sign-in.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-purple-100 flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold text-purple-800 mb-2">🌐 Join the Guthi</h1>
      <p className="text-gray-600 mb-8 text-lg">One Heritage. Many Homes. Infinite Connections.</p>
      <div className="space-y-4">
        <button
          onClick={() => signIn('google')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow transition"
        >
          Sign in with Google
        </button>
        <button
          onClick={() => signIn('facebook')}
          className="bg-[#3b5998] hover:bg-[#2d4373] text-white px-6 py-3 rounded-full shadow transition"
        >
          Sign in with Facebook
        </button>
      </div>
    </main>
  );
}
