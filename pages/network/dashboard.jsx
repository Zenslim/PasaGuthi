
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
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
        // Push to /profiles if not yet created
        setDoc(doc(db, "profiles", user.uid), {
          uid: user.uid,
          name: data.firstName,
          thar: data.thar,
          role: data.role,
          region: data.location,
          photo_url: user.photoURL || "",
          bio: "",
          skills: [],
          diaspora_node: false
        }, { merge: true });
      }
    });
  }, [user]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-rose-50 to-pink-100 p-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-amber-800">🌿 Your Guthi Presence</h1>
        {user && userData ? (
          <UnifiedProfileCard profile={{ ...userData, uid: user.uid, photo_url: user.photoURL }} currentUser={user} />
        ) : (
          <p className="text-red-600 mt-12">Please sign in to view your dashboard.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
