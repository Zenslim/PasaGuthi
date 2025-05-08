import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/planetMessenger.module.css';

const planetPrompts = [
  {
    name: "Earth",
    image: "/planet/earth.png",
    prompts: [
      "Are you happy or just suppressing pain?",
      "When was the last time you felt truly alive?",
      "Are you seeking comfort to forget the pain?",
      "Do you smile to please others or to express joy?",
    ]
  },
  {
    name: "Moon",
    image: "/planet/moon.png",
    prompts: [
      "Who are you when no one sees you?",
      "What childhood memory makes you smile?",
      "What do you feel but afraid to speak?",
      "If you never feel pain, will you ever feel real joy?",
    ]
  },
  {
    name: "Mars",
    image: "/planet/mars.png",
    prompts: [
      "Why do you obey people you’ll never meet?",
      "What happens when you stop saying yes?",
      "Do you wake up to live or just not die??",
      "If the algorithm rewards you, is it love or control?",
    ]
  },
  {
    name: "Jupiter",
    image: "/planet/jupiter.png",
    prompts: [
      "If your job ended tomorrow, what would remain of you?",
      "If your phone vanished today, who would you still be?",
      "Are you living, thriving or merely surviving?",
      "Who wins when you stop asking why?",
    ]
  },
  {
    name: "Saturn",
    image: "/planet/saturn.png",
    prompts: [
      "Are you loyal or just afraid to disappoint?",
      "Who wins when you stop questioning and keep working?",
      "Are your thoughts yours or conditioned?",
      "Whose dream do you fullfil with your time?",
    ]
  },
  {
    name: "Pluto",
    image: "/planet/pluto.png",
    prompts: [
      "If everything is “fine,” why do you feel empty?",
      "What part of you died without you noticing?",
      "How would you like to be remembered?",
      "What does it mean to be authentic?",
    ]
  },
  {
    name: "Populated",
    image: "/planet/populated.png",
    prompts: [
      "Where else would you like to live? Why?",
      "What do you love doing that you aren’t doing?",
      "What's the biggest lie you once believed was true?",
      "Is it more important to love or be loved?",
    ]
  },
];
const directions = [
  { fromX: '-200%', fromY: '-200%', toX: '200%', toY: '200%' },
  { fromX: '200%', fromY: '-200%', toX: '-200%', toY: '200%' },
  { fromX: '-200%', fromY: '200%', toX: '200%', toY: '-200%' },
  { fromX: '200%', fromY: '200%', toX: '-200%', toY: '-200%' },
  { fromX: '0%', fromY: '-200%', toX: '0%', toY: '200%' },
  { fromX: '0%', fromY: '200%', toX: '0%', toY: '-200%' },
  { fromX: '-200%', fromY: '0%', toX: '200%', toY: '0%' },
  { fromX: '200%', fromY: '0%', toX: '-200%', toY: '0%' }
];

export default function PlanetMessenger({ onPromptChange, reflectionSubmitted }) {
  const [planetIndex, setPlanetIndex] = useState(null);
  const [promptIndex, setPromptIndex] = useState(null);
  const [direction, setDirection] = useState(null);

  useEffect(() => {
    const pi = Math.floor(Math.random() * planetPrompts.length);
    const pr = Math.floor(Math.random() * planetPrompts[pi].prompts.length);
    const dir = directions[Math.floor(Math.random() * directions.length)];
    setPlanetIndex(pi);
    setPromptIndex(pr);
    setDirection(dir);

    const prompt = planetPrompts[pi].prompts[pr];
    const planet = planetPrompts[pi];
    onPromptChange({ prompt, planet: planet.name });
  }, []);

  if (planetIndex === null || promptIndex === null || direction === null) return null;

  const planet = planetPrompts[planetIndex];
  const prompt = planet.prompts[promptIndex];

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`flex flex-col items-center space-y-4 ${
          reflectionSubmitted ? styles.planetExit : styles.planetEnter
        }`}
        style={{
          '--fromX': direction.fromX,
          '--fromY': direction.fromY,
          '--toX': direction.toX,
          '--toY': direction.toY,
        }}
      >
        <div className="relative w-40 h-40 sm:w-56 sm:h-56">
          <div className="relative w-full h-full spin-slow">
            <Image
              src={planet.image}
              alt={planet.name}
              fill
              priority
              className="object-contain drop-shadow-xl"
            />
          </div>
        </div>
        <p className="text-white text-lg sm:text-xl text-center max-w-md">{prompt}</p>
      </div>
    </div>
  );
}
