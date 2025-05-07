import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/planetMessenger.module.css';

const planetPrompts = [
  {
    name: "Earth",
    image: "/planet/earth.png",
    prompts: [
      "What makes you feel safe, like home?",
      "When did you last feel truly yourself uncensored?",
      "What childhood memory makes you alive?",
      "What gift are you carrying for your people?"
    ]
  },
  {
    name: "Mars",
    image: "/planet/mars.png",
    prompts: [
      "What would you do, if you weren’t judged?",
      "When was the last time you felt truly alive?",
      "What would you say if you weren’t scared?",
      "What truth are you afraid to say?"
    ]
  },
  {
    name: "Moon",
    image: "/planet/moon.png",
    prompts: [
      "What do you feel but never speak?",
      "What Guthi memory do you carry in silence?",
      "Who are you when no one sees you?",
      "What childhood memory makes your heart smile?"
    ]
  },
  {
    name: "Jupiter",
    image: "/planet/jupiter.png",
    prompts: [
      "What are you here to grow?",
      "What kind of future do you imagine for your kids?",
      "What change do your people need?",
      "What big dream lives inside you?"
    ]
  },
  {
    name: "Pluto",
    image: "/planet/pluto.png",
    prompts: [
      "What must you leave behind?",
      "What pain are you still carrying in silence?",
      "What truth are you still hiding?",
      "What fear blocks your return?"
    ]
  },
  {
    name: "Saturn",
    image: "/planet/saturn.png",
    prompts: [
      "What do you want to leave after you’re gone?",
      "What Guthi truth can’t be forgotten?",
      "What duty did you inherit?",
      "What if you never left Guthi?"
    ]
  },
  {
    name: "Populated",
    image: "/planet/populated.png",
    prompts: [
      "What if Guthi remembers you?",
      "What makes you feel part of the circle?",
      "What is something you can bring to our Guthi?",
      "What if Guthi is just you, finally coming home?"
    ]
  }
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
