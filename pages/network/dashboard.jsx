
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [guthyarCount, setGuthyarCount] = useState(231); // Static for now, could be made dynamic

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setUserData(snap.data());
      }
    };
    fetchUserData();
  }, [user]);

  const handleWhisperClick = () => {
    alert("🕊 EchoesOfGreatness: Why are you proud to be Newar?");
  };

  const daoReady = userData?.karma >= 13 && (userData?.reflections?.length || 0) >= 3;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-rose-50 to-pink-100 p-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-amber-800">
          🌿 Your Presence is Now Part of the Guthi Circle
        </h1>
        {user && userData ? (
          <div className="p-6 border rounded-xl shadow-lg bg-white max-w-xl mx-auto">
            <div className="mb-4 animate-pulse">
              <img
                src={user.photoURL || "/icons/guthi-flame.svg"}
                alt="Guthi Flame"
                className="w-20 h-20 rounded-full mx-auto shadow-md border-4 border-amber-400"
              />
              <p className="text-sm text-gray-500 mt-2">🔥 Guthi Flame Initialized</p>
            </div>
            <h2 className="text-2xl font-semibold text-rose-700">
              {userData.firstName || user.displayName || "Newar Seeker"}
            </h2>
            <p className="text-gray-700">{user.email}</p>
            <p className="mt-2 text-green-800 font-medium">Karma Points: {userData.karma || 0}</p>
            <p className="text-purple-800">Reflections Submitted: {userData.reflections?.length || 0}</p>
            <p className="mt-3 font-semibold text-amber-700">
              🌕 You are the {guthyarCount}th Guthyar this moon.
            </p>

            {daoReady && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
                🔓 <strong>You are now ready to receive your Guthi Key.</strong>
              </div>
            )}

            <div className="mt-6 text-left">
              <p className="text-md font-semibold text-gray-800">Active Projects:</p>
              <ul className="list-disc list-inside text-sm text-indigo-800">
                <li>Healing Circle</li>
                <li>Temple Cleanup Drive</li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-red-600 mt-8">Please sign in to view your dashboard.</p>
        )}

        <div className="mt-10 text-blue-700 underline cursor-pointer" onClick={handleWhisperClick}>
          🕊 Why are you proud to be Newar?
        </div>
      </main>
      <Footer />
    </>
  );
}
