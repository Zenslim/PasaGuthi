
// /lib/firestore.js
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { auth } from "./firebase";

export const db = getFirestore();

export async function handlePostSignIn(user) {
  const uid = user.uid;
  const userRef = doc(db, "users", uid);
  const metaRef = doc(db, "meta", "whisperStats");
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid,
      email: user.email,
      provider: user.providerData[0].providerId,
      createdAt: new Date(),
      completedOnboarding: false,
      has_whispered: false,
      karma: 0
    });
    return { redirect: "/network/welcome" };
  } else {
    const data = userSnap.data();
    return { redirect: data.completedOnboarding ? "/network" : "/network/welcome" };
  }
}

export async function completeOnboarding(uid, profileData) {
  const userRef = doc(db, "users", uid);
  const metaRef = doc(db, "meta", "whisperStats");

  const hasWhispered = !!profileData.whisper_text;

  await updateDoc(userRef, {
    ...profileData,
    completedOnboarding: true,
    karma: 5,
    has_whispered: hasWhispered,
    whisper_timestamp: hasWhispered ? new Date() : null
  });

  if (hasWhispered) {
    const metaSnap = await getDoc(metaRef);
    const currentCount = metaSnap.exists() ? metaSnap.data().whisper_count || 0 : 0;
    await setDoc(metaRef, {
      whisper_count: increment(1),
      guthi_key_unlocked: currentCount + 1 >= 13
    }, { merge: true });
  }
}
