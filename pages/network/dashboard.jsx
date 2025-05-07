
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState(null);

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white p-6">
        <h1 className="text-3xl font-bold mb-4">🌿 Your Dashboard</h1>

        {loading ? (
          <p className="text-gray-500">⏳ Loading your dashboard...</p>
        ) : !user ? (
          <p className="text-red-600">🔒 Please sign in to view your dashboard.</p>
        ) : !userData ? (
          <p className="text-gray-500">📡 Fetching your profile...</p>
        ) : (
          <div className="p-4 border rounded shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold">{userData.name || user.displayName || "Newar Seeker"}</h2>
            <p className="text-sm text-gray-700">{user.email}</p>
            <p className="mt-2 text-green-700">Karma Points: {userData.karma || 0}</p>
            <p className="text-sm">Reflections Submitted: {userData.reflections?.length || 0}</p>
            <p className="mt-2 font-semibold">Active Projects:</p>
            <ul className="list-disc list-inside text-sm text-purple-800">
              <li>Healing Circle</li>
              <li>Temple Cleanup Drive</li>
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
