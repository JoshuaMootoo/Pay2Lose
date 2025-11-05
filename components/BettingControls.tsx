import React from 'react';
import { BetType } from '../types';
import { BET_CONFIG } from '../constants';

interface BettingControlsProps {
  playerBalance: number;
  onBet: (amount: number) => void;
  disabled: boolean;
  selectedBet: { type: BetType; value: any };
}

const BettingControls: React.FC<BettingControlsProps> = ({ playerBalance, onBet, disabled, selectedBet }) => {
  const maxBetForType = BET_CONFIG[selectedBet.type].maxBet;
  const betAmount = Math.min(playerBalance, maxBetForType);

  const handleBet = () => {
    if (betAmount > 0 && betAmount <= playerBalance) {
      onBet(betAmount);
    }
  };

  let betValueDisplay = '';
  switch (selectedBet.type) {
    case BetType.SingleNumber:
      betValueDisplay = `Number ${selectedBet.value}`;
      break;
    case BetType.Dozen:
      betValueDisplay = `${selectedBet.value} Dozen`;
      break;
    case BetType.RedBlack:
      betValueDisplay = `${(selectedBet.value as string).toUpperCase()}`;
      break;
  }
  
  return (
    <div className="bg-slate-800 p-2 lg:p-4 rounded-lg shadow-lg shrink-0">
      <h2 className="text-base lg:text-xl font-semibold text-slate-300 mb-2 border-b-2 border-slate-700 pb-2">Set Your Risk</h2>
      
      <div className="space-y-2">
        <div className="text-xs text-slate-300 text-center bg-slate-700/50 p-2 rounded-md">
            Selected Bet: <span className="font-bold text-emerald-300">{BET_CONFIG[selectedBet.type].name} - {betValueDisplay}</span>
            <span className="block text-[11px] text-slate-400">{BET_CONFIG[selectedBet.type].description}</span>
        </div>

        <div className="text-center">
          <p className="text-xs font-medium text-slate-400">Bet Amount</p>
          <p className="font-mono text-xl lg:text-3xl font-bold text-emerald-300">${betAmount.toLocaleString()}</p>
          <p className="text-xs text-slate-500">(Max for type)</p>
        </div>
        
        <button
          onClick={handleBet}
          disabled={disabled || playerBalance <= 0 || betAmount <= 0}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-2 px-4 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/30 text-base"
        >
          Spin to Lose
        </button>
      </div>
    </div>
  );
};

export default BettingControls;
