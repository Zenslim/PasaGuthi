
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import axios from "axios";

export const useWhisper = () => {
  const [loading, setLoading] = useState(false);
  const [echo, setEcho] = useState("");

  const sendWhisper = async ({ text, thar, mood }) => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid || "unknown";
      const whisper = {
        uid,
        text,
        thar,
        mood,
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "whispers"), whisper);

      const prompt = `You are the ancestral voice of the Newar Guthi. Someone whispered: "${text}". Reflect back with a poetic echo in 1–2 lines.`;

      const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
        model: "anthropic/claude-3-sonnet",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.8
      }, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      const echoText = response.data.choices?.[0]?.message?.content || "…the silence responds with memory.";

      await addDoc(collection(db, "echoes"), {
        uid,
        whisperId: docRef.id,
        echo: echoText,
        timestamp: serverTimestamp()
      });

      setEcho(echoText);
    } catch (err) {
      console.error("Whisper error:", err);
      setEcho("Something went quiet…");
    }
    setLoading(false);
  };

  return { sendWhisper, echo, loading };
};
