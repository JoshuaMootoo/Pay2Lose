
import React from 'react';

interface PauseModalProps {
  onResume: () => void;
  onQuit: () => void;
}

const PauseModal: React.FC<PauseModalProps> = ({ onResume, onQuit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-800 border-2 border-slate-600 rounded-lg shadow-2xl p-8 text-center max-w-sm mx-auto animate-fade-in-up">
        <h2 className="text-3xl font-bold text-slate-200">
          Game Paused
        </h2>
        <div className="mt-8 space-y-4">
            <button
              onClick={onResume}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
            >
              Resume Game
            </button>
            <button
              onClick={onQuit}
              className="w-full bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-all duration-300"
            >
              Quit to Main Menu
            </button>
        </div>
      </div>
    </div>
  );
};

export default PauseModal;
