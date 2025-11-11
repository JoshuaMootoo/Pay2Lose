import React from 'react';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  isCurrent: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isCurrent }) => {
  const isBroke = player.balance <= 0;
  const cardClasses = `
    p-1.5 rounded-lg shadow-md transition-all duration-300 ease-in-out border-2
    shrink-0 w-36 md:w-44
    ${isCurrent ? 'bg-emerald-900/50 border-emerald-400' : 'bg-slate-800 border-slate-700'}
    ${isBroke ? 'opacity-50' : ''}
  `;

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-center gap-2">
        <h3 className="text-sm md:text-lg font-bold truncate">{player.name}</h3>
        {player.isAI && (
          <span className="text-[9px] md:text-xs font-medium bg-slate-700 text-slate-200 px-2 py-0.5 rounded-lg">
            {player.personality}
          </span>
        )}
      </div>
      <div className="mt-0.5">
        <p className="text-base md:text-2xl font-mono font-semibold text-emerald-300">
          ${player.balance.toLocaleString()}
        </p>
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (player.balance / 1000) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;