
// VoiceToText.jsx — Speech recognition to text

import { useState } from 'react';

export default function VoiceToText({ onResult }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return;

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      onResult(speechResult);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
    };

    recognition.onend = () => setListening(false);

    setListening(true);
    recognition.start();
  };

  return (
    <button
      onClick={startListening}
      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
    >
      🎙 {listening ? 'Listening...' : 'Speak'}
    </button>
  );
}
