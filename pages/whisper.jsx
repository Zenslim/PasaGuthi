'use client';

import { useState, useRef } from 'react';
import PlanetMessenger from '@/components/PlanetMessenger';
import CelestialBackground from '@/components/CelestialBackground';
import VoiceToText from '@/components/VoiceToText';
import ImageUpload from '@/components/ImageUpload';
import MirrorSummaryDrawer from '@/components/MirrorSummaryDrawer';
import { generateMirrorSummary } from '@/lib/mirrorEngineDeepseek';

export default function WhisperPage() {
  const [reflection, setReflection] = useState('');
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentPlanet, setCurrentPlanet] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const inputRef = useRef();

  const handleSubmit = async () => {
    if (!reflection.trim() && !image) return;
    setLoading(true);

    const result = await generateMirrorSummary({
      text: reflection,
      imageMeta: image,
      timestamp: Date.now(),
      userId: 'anonymous',
      celestialPrompt: currentPrompt,
      planet: currentPlanet
    });

    setReflections((prev) => [...prev, result]);
    setReflection('');
    setImage(null);
    setLoading(false);
    setShowSummary(true);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white">
      <CelestialBackground />

      <div className="absolute top-1/4 w-full flex justify-center px-4 animate-fade-in">
        <PlanetMessenger
          onPromptChange={({ prompt, planet }) => {
            setCurrentPrompt(prompt);
            setCurrentPlanet(planet);
          }}
          reflectionSubmitted={showSummary}
        />
      </div>

      <div className="absolute bottom-32 w-full flex flex-col items-center px-4 space-y-4">
        {!showSummary && reflections.length > 0 && (
          <div className="text-center space-y-4 w-full max-w-xl">
            {reflections.map((entry, index) => (
              <div key={index} className="bg-black bg-opacity-30 p-4 rounded border border-white/10">
                <p className="text-purple-300 italic">{entry.mirrorReply}</p>
                {entry.mythicWhisper && (
                  <p className="text-sm text-gray-400 mt-1">{entry.mythicWhisper}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={inputRef}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Type Your Whisper..."
          className="w-full max-w-xl p-4 text-lg text-white bg-black bg-opacity-50 rounded-lg border border-white/10 backdrop-blur placeholder-white/50"
          rows={3}
        />
        <div className="flex items-center gap-4">
          <VoiceToText onResult={setReflection} />
          <ImageUpload onUpload={setImage} />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-lg shadow text-white text-lg transition-all duration-300 ${
              loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800'
            }`}
          >
            {loading ? '✨ Generating your mirror...' : 'Send'}
          </button>
        </div>
      </div>

      {showSummary && (
        <MirrorSummaryDrawer
          summary={reflections[reflections.length - 1]?.mirrorReply || ''}
          isOpen={showSummary}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}
