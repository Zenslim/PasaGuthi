import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function handlePostSignIn(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || '',
      email: user.email || '',
      karma: 0,
      reflections: [],
      createdAt: new Date().toISOString(),
    });
  }

  const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
  return { redirect: isNewUser ? '/network/welcome' : '/network/dashboard' };
}
