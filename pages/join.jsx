import { useState } from "react";
import { supabase } from '../lib/supabaseClient';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Join() {
  const [joined, setJoined] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleJoin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setJoined(true);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const handleEmailJoin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      setJoined(true);
    } catch (error) {
      console.error("Email sign-in error:", error);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">🌱 Join Pasaguthi DAO</h1>
        <p className="mb-6 max-w-lg">
          Co-own our cultural future. Contribute your skills and spirit to rebuild Nepal through community-led action.
        </p>

        {!joined ? (
          <>
            <div className="space-y-4">
              <button
                onClick={handleGoogleJoin}
                className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
              >
                Join with Google
              </button>

              <div className="border-t border-gray-300 my-4" />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 border rounded w-full"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-2 border rounded w-full"
              />
              <button
                onClick={handleEmailJoin}
                className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
              >
                Join with Email
              </button>
            </div>
          </>
        ) : (
          <div className="text-green-700">
            <p className="text-xl font-semibold mb-2">🙏 Welcome, {user.displayName || user.email || "Friend"}!</p>
            <p>Your journey as a Pasaguthi co-creator has begun.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
