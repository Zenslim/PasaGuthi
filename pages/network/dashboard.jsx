
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [guthyarCount, setGuthyarCount] = useState(231);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    firstName: "",
    thar: "",
    gender: "",
    location: "",
    role: ""
  });

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        const incomplete = !data.firstName || !data.thar || !data.gender;
        if (incomplete) setStep(1);
      }
    };
    fetchUserData();
  }, [user]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const completeOnboarding = async () => {
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, {
      ...profile,
      completedOnboarding: true,
      karma: 5
    });
    setUserData((prev) => ({ ...prev, ...profile, completedOnboarding: true, karma: 5 }));
    setStep(0);
  };

  const onboardingSteps = [
    {
      prompt: "🌿 What name shall we greet you by?",
      field: "firstName",
    },
    {
      prompt: "🪷 Which Thar do you carry in your breath?",
      field: "thar",
    },
    {
      prompt: "🌸 Shall we address you as Ma’am or Sir?",
      field: "gender",
    },
    {
      prompt: "🌍 Where do your feet rest now?",
      field: "location",
    },
    {
      prompt: "🎁 Do you carry a gift, skill, or vow?",
      field: "role",
    },
  ];

  const daoReady = userData?.karma >= 13 && (userData?.reflections?.length || 0) >= 3;

  const handleWhisperClick = () => {
    alert("🕊 EchoesOfGreatness: Why are you proud to be Newar?");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-rose-50 to-pink-100 p-6 flex items-center justify-center">
        {user && userData ? (
          step > 0 ? (
            <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8 space-y-4 text-left">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{onboardingSteps[step - 1].prompt}</h2>
              {onboardingSteps[step - 1].field === "gender" ? (
  <select
    value={profile.gender}
    onChange={(e) => handleChange("gender", e.target.value)}
    className="border p-2 rounded w-full text-black"
  >
    <option value="">Select</option>
    <option value="Ma'am">Ma&apos;am</option>
    <option value="Sir">Sir</option>
  </select>
) : onboardingSteps[step - 1].field === "thar" ? (
  <input
    list="thars"
    value={profile.thar}
    onChange={(e) => handleChange("thar", e.target.value)}
    className="border p-2 rounded w-full text-black"
  />
) : (
  <input
    type="text"
    value={profile[onboardingSteps[step - 1].field]}
    onChange={(e) => handleChange(onboardingSteps[step - 1].field, e.target.value)}
    className="border p-2 rounded w-full text-black"
  />
)}
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                onClick={step < onboardingSteps.length ? handleNext : completeOnboarding}
              >
                {step < onboardingSteps.length ? "Next" : "Complete"}
              </button>
            </div>
          ) : (
            <div className="p-6 border rounded-xl shadow-lg bg-white max-w-xl mx-auto">
              <div className="mb-4 mt-4 animate-pulse">
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
              <div className="mt-10 text-blue-700 underline cursor-pointer" onClick={handleWhisperClick}>
                🕊 Why are you proud to be Newar?
              </div>
            </div>
          )
        ) : (
          <p className="text-red-600 mt-8">Please sign in to view your dashboard.</p>
        )}
      </main>
      <Footer />
    </>
  );
}

<datalist id="thars">
  <option value="Shilpakar" />
  <option value="Pradhan" />
  <option value="Tuladhar" />
  <option value="Bajracharya" />
  <option value="Shrestha" />
  <option value="Joshi" />
  <option value="Maharjan" />
  <option value="Dangol" />
  <option value="Sthapit" />
  <option value="Awale" />
</datalist>
