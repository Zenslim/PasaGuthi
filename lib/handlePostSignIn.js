import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';

export async function handlePostSignIn(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  // Only create user record if it doesn't exist
  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || '',
      email: user.email || '',
      karma: 0,
      reflections: [],
      createdAt: new Date().toISOString(),
    });
  }

  // ✅ Store UID in localStorage for session persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('guthiUid', user.uid);
  }

  // 🔐 Optional: Firebase Identity Toolkit token lookup
  try {
    const auth = getAuth();
    const idToken = await user.getIdToken();

    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      console.warn("ID token lookup failed:", await res.json());
    } else {
      const lookupData = await res.json();
      console.log("Firebase account lookup:", lookupData);
    }
  } catch (err) {
    console.error("Error during ID token check:", err);
  }

  const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
  return { redirect: isNewUser ? '/network/welcome' : '/network/dashboard' };
}
