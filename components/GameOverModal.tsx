
import React from 'react';
import { Player } from '../types';

interface GameOverModalProps {
  winner: Player;
  onRestart: () => void;
  onBackToMenu: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onRestart, onBackToMenu }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-800 border-2 border-emerald-400 rounded-lg shadow-2xl p-8 text-center max-w-sm mx-auto animate-fade-in-up">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
          Game Over!
        </h2>
        <p className="mt-4 text-lg text-slate-300">
          Congratulations to
          <span className="font-bold text-amber-300 block text-2xl my-2">{winner.name}</span>
          for successfully losing all their money!
        </p>
        <p className="text-slate-400">They are the ultimate loser, and therefore, the WINNER!</p>
        <div className="mt-8 space-y-4">
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
          >
            Play Again
          </button>
          <button
            onClick={onBackToMenu}
            className="w-full bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-all duration-300"
          >
            Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
