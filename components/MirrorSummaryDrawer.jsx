
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
          >
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-center">✨ Mirror Summary</h2>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-zinc-800 p-4 rounded">
                {summary}
              </pre>
            </div>
            <div className="mt-6 text-center space-y-2">
              <p className="text-lg font-semibold">{ctaMessages[ctaIndex].split(" — ")[0]}</p>
              <button
                onClick={async () => {
                  const { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } = await import("firebase/auth");
                  const { auth } = await import("../lib/firebase");
                  const { handlePostSignIn } = await import("../lib/firestore");

                  try {
                    const useGoogle = await new Promise((resolve) => {
                      const choice = window.open("", "SignInChoice", "width=420,height=400");
                      if (!choice) return resolve(true);
                      choice.document.write(`
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
                      `);
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
                className="bg-purple-600 hover:bg-purple-700 transition text-white px-6 py-2 rounded-full"
              >
                {ctaMessages[ctaIndex].split(" — ")[1]}
              </button>
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-200 mt-4 underline"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
