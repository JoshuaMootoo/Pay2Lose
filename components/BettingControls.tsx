
import React, { useState, useEffect } from 'react';
import { BetType } from '../types';
import { BET_CONFIG } from '../constants';

interface BettingControlsProps {
  playerBalance: number;
  onBet: (betType: BetType, amount: number) => void;
  disabled: boolean;
}

const BettingControls: React.FC<BettingControlsProps> = ({ playerBalance, onBet, disabled }) => {
  const [selectedBetType, setSelectedBetType] = useState<BetType>(BetType.SingleNumber);
  
  const maxBetForType = BET_CONFIG[selectedBetType].maxBet;
  const maxBet = playerBalance > 0 ? Math.min(playerBalance, maxBetForType) : 1;
  
  const [amount, setAmount] = useState(Math.min(maxBetForType, playerBalance > 0 ? playerBalance : 1));

  useEffect(() => {
    const newMaxBet = Math.min(playerBalance, BET_CONFIG[selectedBetType].maxBet);
    if (amount > newMaxBet) {
      setAmount(newMaxBet);
    }
  }, [selectedBetType, playerBalance, amount]);

  const handleBet = () => {
    if (amount > 0 && amount <= playerBalance) {
      onBet(selectedBetType, amount);
    }
  };
  
  const handleSelectBetType = (betType: BetType) => {
    setSelectedBetType(betType);
    const newMaxBet = Math.min(playerBalance, BET_CONFIG[betType].maxBet);
    // When changing bet type, if the current amount is over the new limit, clamp it.
    if(amount > newMaxBet) {
      setAmount(newMaxBet)
    }
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-slate-300 mb-4 border-b-2 border-slate-700 pb-2">Place Your Bet</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="bet-amount" className="block mb-2 text-sm font-medium text-slate-400">
            Bet Amount: <span className="font-mono text-lg text-emerald-300">${amount}</span>
          </label>
          <input
            id="bet-amount"
            type="range"
            min="1"
            max={maxBet}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={disabled || playerBalance <= 0}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(BET_CONFIG) as BetType[]).map((key) => (
            <button
              key={key}
              onClick={() => handleSelectBetType(key)}
              disabled={disabled}
              className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${
                selectedBetType === key
                  ? 'bg-emerald-900/50 border-emerald-400 ring-2 ring-emerald-400'
                  : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-3">
                <div className="text-emerald-400">{BET_CONFIG[key].icon}</div>
                <div>
                  <h4 className="font-bold">{BET_CONFIG[key].name}</h4>
                  <p className="text-xs text-slate-400">{BET_CONFIG[key].description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleBet}
          disabled={disabled || playerBalance <= 0 || amount <= 0}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/30 text-lg"
        >
          Spin to Lose
        </button>
      </div>
    </div>
  );
};

export default BettingControls;