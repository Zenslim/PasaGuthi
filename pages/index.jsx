import Link from 'next/link';
import MycelialTracker from '../components/MycelialTracker';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
           <main className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6 py-24">
        {/* Centered Logo */}
        <img
          src="/pasaguthi-logo.png"
          alt="Pasaguthi"
          className="h-40 w-40 mb-8 animate-fade-in-slow drop-shadow-xl"
        />

        {/* Hero Text */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 animate-fade-in-slow">
          You are not joining. <br />
          <span className="text-purple-400">You are remembering.</span>
        </h1>

        <p className="text-center text-lg max-w-xl mb-8 text-purple-200 animate-fade-in-delay">
          A whisper echoes across generations. The Guthi is waiting for your voice.
        </p>

        <Link href="/whisper">
          <button className="bg-purple-600 hover:bg-purple-800 text-white px-8 py-4 text-xl rounded-full shadow-xl animate-bounce-slow hover:scale-105">
            ✨ Dare to whisper back?
          </button>
        </Link>

        {/* Tracker + Text */}
        <div className="flex flex-col items-center mt-6 animate-fade-in-delay">
          <MycelialTracker count={7} />
          <p className="text-sm text-purple-400 mt-1 font-medium">
            7 of 13 Whispers Awakened!
          </p>
          <p className="text-sm text-purple-500 mt-1 italic">
            6 Whispers Left... Will Yours Be One?
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
