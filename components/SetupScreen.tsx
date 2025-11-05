
import React, { useState, useMemo } from 'react';

interface SetupScreenProps {
  onGameSetupComplete: (playerNames: string[]) => void;
  onBack: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onGameSetupComplete, onBack }) => {
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(() => Array.from({ length: 10 }, (_, i) => `Player ${i + 1}`));

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const currentPlayers = useMemo(() => playerNames.slice(0, numPlayers), [playerNames, numPlayers]);
  const isStartDisabled = useMemo(() => currentPlayers.some(name => name.trim() === ''), [currentPlayers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStartDisabled) {
      onGameSetupComplete(currentPlayers);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6 sm:p-8 text-center max-w-md w-full">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-6">
          Setup Local Game
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="player-count" className="block text-lg font-medium text-slate-300 mb-2">
              Number of Players: <span className="font-bold text-emerald-300">{numPlayers}</span>
            </label>
            <input
              id="player-count"
              type="range"
              min="2"
              max="10"
              value={numPlayers}
              onChange={(e) => setNumPlayers(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
            {Array.from({ length: numPlayers }).map((_, index) => (
              <div key={index}>
                <label htmlFor={`player-${index}`} className="sr-only">Player {index + 1} Name</label>
                <input
                  id={`player-${index}`}
                  type="text"
                  value={playerNames[index]}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  maxLength={15}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md py-2 px-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  required
                />
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onBack}
              className="w-full bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-all duration-300"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isStartDisabled}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;
