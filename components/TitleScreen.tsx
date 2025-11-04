
import React from 'react';

interface TitleScreenProps {
  onStartGame: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="text-center max-w-lg mx-auto">
        <div className="animate-fade-in-up">
            <h1 className="text-5xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            Reverse Roulette
            </h1>
            <p className="text-slate-400 mt-4 text-lg sm:text-xl">
            The goal is to go broke. Don't win!
            </p>
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 w-full max-w-xs mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={onStartGame}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 text-xl"
          >
            Start Game
          </button>
          <div className="relative w-full">
            <button
              disabled
              className="w-full bg-slate-800 border-2 border-slate-700 text-slate-500 font-bold py-4 px-6 rounded-lg cursor-not-allowed text-xl"
            >
              Local Multiplayer
            </button>
             <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-amber-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full rotate-12">
                SOON
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
