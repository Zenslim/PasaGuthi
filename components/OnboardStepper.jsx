// Final JSX Implementation of OnboardStepper.jsx

import { useState, useEffect } from 'react';
import { signInWithGoogle, signInWithEmail } from '../lib/auth';
import { checkTharMatch } from '../utils/checkTharMatch';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import tharList from '../data/tharList.json';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/router';

export default function OnboardStepper() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState('');
  const [tharConfirmed, setTharConfirmed] = useState(false);
  const [user, setUser] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [filteredThar, setFilteredThar] = useState([]);
  const [tharMatched, setTharMatched] = useState(false);
  const [loginNameThar, setLoginNameThar] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (surname.trim().length >= 1) {
      const matches = tharList.filter(thar =>
        thar.toLowerCase().startsWith(surname.toLowerCase())
      );
      setFilteredThar(matches.slice(0, 10));
    } else {
      setFilteredThar([]);
    }
  }, [surname]);

  useEffect(() => {
    if (user && surname && tharList.includes(surname)) {
      const result = checkTharMatch(surname, user.displayName, tharList);
      setLoginNameThar(result.loginThar);
      setMatchResult(result);
      setTharMatched(result.match);
      if (result.match || tharConfirmed) {
        setStep(4);
        generateGuthiKey(user.uid);
        const timeout = setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
        return () => clearTimeout(timeout);
      } else {
        setStep(3);
      }
    }
  }, [user, surname, tharConfirmed]);

  const handleNext = () => {
    if (step === 0 && firstName && surname) {
      const isKnown = tharList.includes(surname);
      if (!isKnown) {
        setStep(99); // Blocked state
        return;
      }
      setStep(1);
    } else if (step === 1 && gender) {
      setStep(2);
    }
  };

  const generateGuthiKey = async (uid) => {
    await setDoc(doc(db, 'guthiKeys', uid), {
      uid,
      name: user.displayName,
      thar: surname,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-6 relative text-sm text-gray-700">
      {/* Step 0 - Name + Thar */}
      {step === 0 && (
        <>
          <div>
            <label className="block text-xs mb-1 text-gray-500">First Name (English)</label>
            <input
              className="w-full border px-4 py-2 rounded-lg"
              placeholder="e.g. Nabin"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="relative">
            <label className="block text-xs mb-1 text-gray-500">Surname (Thar)</label>
            <input
              className="w-full border px-4 py-2 rounded-lg"
              placeholder="e.g. Pradhan"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
            {filteredThar.length > 0 && (
              <ul className="absolute z-20 bg-white border mt-1 w-full max-h-48 overflow-y-auto shadow-xl rounded-md text-sm">
                {filteredThar.map((thar) => (
                  <li
                    key={thar}
                    className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                    onClick={() => setSurname(thar)}
                  >
                    {thar}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={handleNext} className="w-full bg-purple-700 text-white py-2 rounded-lg mt-4">
            Next
          </button>
        </>
      )}

      {/* Step 99 - Thar Not Verified (Blocked) */}
      {step === 99 && (
        <div className="text-center bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-700 font-semibold">Sorry, '{surname}' is not a verified Newar Thar.</p>
          <p className="text-sm text-gray-600 mt-2">Pasaguthi is currently only open to verified Newars.</p>
          <p className="text-sm text-gray-600">Please email <strong>verify@pasaguthi.org</strong> with proof of your Thar.</p>
          <button
            onClick={() => setStep(0)}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 1 - Gender */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Shall we address you as:</p>
          <div className="flex gap-4">
            <button
              className={`flex-1 py-2 rounded-lg ${gender === 'female' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setGender('female')}
            >
              Ma'am
            </button>
            <button
              className={`flex-1 py-2 rounded-lg ${gender === 'male' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setGender('male')}
            >
              Sir
            </button>
          </div>
          <button onClick={handleNext} className="w-full bg-purple-700 text-white py-2 rounded-lg">
            Next
          </button>
        </div>
      )}

      {/* Step 2 - Sign In */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Continue with:</p>
          <button onClick={signInWithGoogle} className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <FcGoogle size={20} /> <span>Sign in with Google</span>
          </button>
          <button onClick={signInWithEmail} className="w-full border py-2 rounded-lg text-center">
            Sign in with Email
          </button>
        </div>
      )}

      {/* Step 3 - Thar Mismatch */}
      {step === 3 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800 font-medium">
            Your login says '{loginNameThar}', but you entered Thar '{surname}'. Are you sure?
          </p>
          <div className="flex justify-between mt-4">
            <button onClick={() => setStep(0)} className="bg-gray-200 px-4 py-2 rounded-lg">
              No, Go Back
            </button>
            <button onClick={() => setTharConfirmed(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg">
              Yes, Confirm Anyway
            </button>
          </div>
        </div>
      )}

      {/* Step 4 - Final Guthi Key */}
      {step === 4 && user && (tharMatched || tharConfirmed) && (
        <div className="text-center text-green-700 bg-green-50 border border-green-200 p-4 rounded-lg">
          ✅ You’re now part of the Guthi! Your Guthi Key is being generated...
        </div>
      )}
    </div>
  );
}
