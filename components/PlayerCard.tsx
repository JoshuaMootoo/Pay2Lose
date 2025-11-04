
import React from 'react';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  isCurrent: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isCurrent }) => {
  const isBroke = player.balance <= 0;
  const cardClasses = `
    p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out border-2
    ${isCurrent ? 'bg-emerald-900/50 border-emerald-400 scale-105' : 'bg-slate-800 border-slate-700'}
    ${isBroke ? 'opacity-50' : ''}
  `;

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold truncate">{player.name}</h3>
        {player.isAI && (
          <span className="text-xs font-medium bg-cyan-600/50 text-cyan-200 px-2 py-1 rounded-full">
            {player.personality}
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-mono font-semibold text-emerald-300">
          ${player.balance.toLocaleString()}
        </p>
        <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (player.balance / 1000) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
