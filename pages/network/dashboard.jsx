import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const checkOrCreateProfile = async () => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          provider: user.providerData[0].providerId,
          createdAt: serverTimestamp(),
          presence: "new",
          karma: 0,
          completedOnboarding: false,
        });
        setProfile(null);
      } else {
        const data = userSnap.data();

        // Minimal onboarding in place
        if (!data.completedOnboarding) {
          const firstName = prompt("What name shall we greet you by?");
          const thar = prompt("Which Thar do you carry in your breath?");
          const gender = prompt("Shall we address you as Ma’am or Sir?");
          const location = prompt("Where do your feet rest now?");
          const role = prompt("Do you carry a gift, skill, or vow?");

          await updateDoc(userRef, {
            firstName,
            thar,
            gender,
            location,
            role,
            completedOnboarding: true,
            karma: 5
          });

          setProfile({ ...data, firstName, thar, gender, location, role, completedOnboarding: true });
        } else {
          setProfile(data);
        }
      }

      setLoading(false);
    };

    checkOrCreateProfile();
  }, [user]);

  if (loading || !user) return <div className="p-10 text-center">🌙 Loading your Guthi Circle...</div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white p-6">
        <h1 className="text-3xl font-bold mb-4">🌿 Your Dashboard</h1>
        <div className="p-4 border rounded shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold">{profile?.firstName || user.displayName}</h2>
          <p className="text-sm text-gray-700">{user.email}</p>
          <p className="mt-2 text-green-700">Karma Points: {profile?.karma ?? 0}</p>
          <p className="text-sm">Reflections Submitted: 5</p>
          <p className="mt-2 font-semibold">Active Projects:</p>
          <ul className="list-disc list-inside text-sm text-purple-800">
            <li>Healing Circle</li>
            <li>Temple Cleanup Drive</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
