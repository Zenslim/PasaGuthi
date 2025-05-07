
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import UnifiedProfileCard from "../../components/UnifiedProfileCard";

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setDoc(doc(db, "profiles", user.uid), {
          uid: user.uid,
          name: data.firstName,
          thar: data.thar,
          role: data.role,
          region: data.location,
          photo_url: user.photoURL || "",
          bio: data.bio || "",
          skills: data.skills || [],
          diaspora_node: false
        }, { merge: true });
      }
    });
  }, [user]);

  const reflectionCount = userData?.reflections?.length || 0;
  const karma = userData?.karma || 0;
  const guthyarRank = ((userData?.firstName?.length || 1) * (karma || 1)) % 1088;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-rose-50 to-pink-100 p-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-amber-800">🌿 Your Guthi Presence</h1>

        {user && userData ? (
          <>
            <UnifiedProfileCard profile={{ ...userData, uid: user.uid, photo_url: user.photoURL }} currentUser={user} />

            <div className="max-w-md mx-auto mt-6 p-4 bg-gray-100 rounded-xl text-left space-y-3 text-sm">
              <p><strong>🔥 Karma Points:</strong> {karma}</p>
              <p><strong>📝 Reflections Submitted:</strong> {reflectionCount}</p>
              <p><strong>🌕 Moonline Rank:</strong> You are the {guthyarRank}th Guthyar this moon.</p>
              <p className="text-blue-800 font-medium hover:underline cursor-pointer">
                🕊️ Why are you proud to be Newar?
              </p>
              <div>
                <p className="font-semibold text-gray-800">🌿 Active Projects:</p>
                <ul className="list-disc list-inside text-green-800 pl-4">
                  <li>Healing Circle</li>
                  <li>Temple Cleanup Drive</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p className="text-red-600 mt-12">Please sign in to view your dashboard.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
