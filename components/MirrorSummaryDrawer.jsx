import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

const ctaMessages = [
  "🌿 Join the Guthi — Your voice matters here.",
  "🪷 Enter the Guthi — Be part of something special.",
  "🌀 Join the Guthi — You don’t have to walk alone.",
  "🌌 Say yes to the Guthi — Your story belongs with ours.",
  "🔥 Join the Guthi — You’re braver than you think."
];

export default function MirrorSummaryDrawer({ summary, isOpen, onClose }) {
  const router = useRouter();
  const [ctaIndex, setCtaIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCtaIndex((prev) => (prev + 1) % ctaMessages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-zinc-900 text-white w-full max-w-md md:max-w-lg h-[80%] rounded-lg shadow-lg flex flex-col p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-2">🪞 Mirror Summary</h2>

            <motion.div
              className="flex-1 overflow-y-auto text-lg md:text-xl whitespace-pre-wrap leading-relaxed pr-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {summary}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.button
                key={ctaIndex}
                onClick={async () => {
      const { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } = await import("firebase/auth");
      const { auth } = await import("../lib/firebase");
      const { handlePostSignIn } = await import("../lib/firestore");

      try {
        const useGoogle = await new Promise((resolve) => {
          const choice = window.open("", "SignInChoice", "width=420,height=400");
          if (!choice) return resolve(true);
          choice.document.write(\`
            <style>
              body {
                margin: 0;
                font-family: sans-serif;
                background: #fff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
              }
              h1 {
                font-size: 20px;
                margin-bottom: 2rem;
                color: #4B0082;
              }
              button {
                padding: 12px 24px;
                margin: 8px;
                font-size: 14px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                width: 200px;
              }
              .google { background-color: #4285F4; color: white; }
              .facebook { background-color: #3b5998; color: white; }
            </style>
            <h1>🌐 One Heritage. Many Homes.<br/>Infinite Connections.</h1>
            <button class='google' onclick="window.opener.postMessage('google', '*'); window.close()">Join with Google</button>
            <button class='facebook' onclick="window.opener.postMessage('facebook', '*'); window.close()">Join with Facebook</button>
          \`);
          window.addEventListener("message", (e) => {
            if (e.data === "google") resolve(true);
            if (e.data === "facebook") resolve(false);
          }, { once: true });
        });

        const provider = useGoogle ? new GoogleAuthProvider() : new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const redirect = await handlePostSignIn(result.user);
        router.push(redirect.redirect);
      } catch (error) {
        console.error("Sign-in failed:", error);
        alert("Something went wrong during sign-in.");
      }
    }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="mt-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white py-3 px-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 w-full text-center"
              >
                <div className="flex flex-col items-center justify-center leading-tight">
                  <div className="text-lg md:text-xl font-bold text-center">
                    {ctaMessages[ctaIndex].split("—")[0]}
                  </div>
                  <div className="text-sm md:text-base font-light opacity-90 text-center mt-1">
                    {ctaMessages[ctaIndex].split("—")[1].trim()}
                  </div>
                </div>
              </motion.button>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
