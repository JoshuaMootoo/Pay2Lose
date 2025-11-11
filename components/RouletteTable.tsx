import React from 'react';
import { BetType } from '../types';
import { ROULETTE_NUMBERS, BET_CONFIG } from '../constants';

interface RouletteTableProps {
  selectedBet: { type: BetType; value: any };
  onBetSelectionChange: (bet: { type: BetType; value: any }) => void;
  disabled: boolean;
  playerBalance: number;
  onBet: (amount: number) => void;
  isPanelVersion: boolean;
  showBettingControls: boolean;
  className?: string;
}

const getNumberColorClass = (num: number) => {
  if (ROULETTE_NUMBERS.red.includes(num)) return 'bg-red-600 text-white';
  if (ROULETTE_NUMBERS.black.includes(num)) return 'bg-slate-900 text-white';
  return 'bg-green-500 text-white'; // for 0
};

const RouletteTable: React.FC<RouletteTableProps> = ({ selectedBet, onBetSelectionChange, disabled, playerBalance, onBet, isPanelVersion, showBettingControls, className }) => {
    
    const baseButtonClasses = `transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 text-[9px] sm:text-xs md:text-sm font-bold rounded-md flex items-center justify-center h-full`;
    const hoverClasses = !disabled ? 'hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-800 hover:ring-amber-300/70' : '';
    const isSelected = (type: BetType, value: any) => selectedBet.type === type && selectedBet.value === value;

    // --- Betting Controls Logic ---
    const maxBetForType = BET_CONFIG[selectedBet.type].maxBet;
    const betAmount = Math.min(playerBalance, maxBetForType);

    const handleBet = () => {
        if (betAmount > 0 && betAmount <= playerBalance) {
        onBet(betAmount);
        }
    };

    let betValueDisplay = '';
    switch (selectedBet.type) {
        case BetType.SingleNumber: betValueDisplay = `Number ${selectedBet.value}`; break;
        case BetType.Dozen: betValueDisplay = `${selectedBet.value} Dozen`; break;
        case BetType.RedBlack: betValueDisplay = `${(selectedBet.value as string).toUpperCase()}`; break;
    }
    // --- End Betting Controls Logic ---

    const topRowNumbers = Array.from({ length: 12 }, (_, i) => (i + 1) * 3);
    const middleRowNumbers = Array.from({ length: 12 }, (_, i) => i * 3 + 2);
    const bottomRowNumbers = Array.from({ length: 12 }, (_, i) => i * 3 + 1);

    const mainContainerClasses = isPanelVersion
        ? "bg-slate-800 p-2 md:p-4 rounded-lg shadow-lg flex flex-col min-w-0 text-center font-sans h-full border border-slate-700"
        : "flex-grow min-w-0 text-center font-sans w-full flex flex-col";


    return (
        <div className={`${mainContainerClasses} ${className || ''}`}>
            {isPanelVersion && <h3 className="text-sm md:text-base lg:text-lg font-semibold text-slate-300 mb-2 shrink-0">Choose Bet Type</h3>}
            
            <div className="grid grid-cols-[1fr_repeat(12,_minmax(0,_1fr))] grid-rows-5 gap-1 flex-grow">
                {/* Zero */}
                <button
                    onClick={() => onBetSelectionChange({ type: BetType.SingleNumber, value: 0 })}
                    disabled={disabled}
                    className={`row-span-3 ${baseButtonClasses} ${hoverClasses} ${getNumberColorClass(0)} ${isSelected(BetType.SingleNumber, 0) ? 'ring-2 md:ring-4 ring-amber-300' : 'border-slate-700'}`}
                    aria-label="Bet on 0"
                >
                    0
                </button>

                {/* Top Row Numbers */}
                {topRowNumbers.map(num => (
                    <button
                        key={num}
                        onClick={() => onBetSelectionChange({ type: BetType.SingleNumber, value: num })}
                        disabled={disabled}
                        className={`${baseButtonClasses} ${hoverClasses} ${getNumberColorClass(num)} ${isSelected(BetType.SingleNumber, num) ? 'ring-2 md:ring-4 ring-amber-300' : 'border-slate-700'}`}
                        aria-label={`Bet on number ${num}`}
                    >
                        {num}
                    </button>
                ))}

                {/* Middle Row Numbers */}
                {middleRowNumbers.map(num => (
                    <button
                        key={num}
                        onClick={() => onBetSelectionChange({ type: BetType.SingleNumber, value: num })}
                        disabled={disabled}
                        className={`${baseButtonClasses} ${hoverClasses} ${getNumberColorClass(num)} ${isSelected(BetType.SingleNumber, num) ? 'ring-2 md:ring-4 ring-amber-300' : 'border-slate-700'}`}
                        aria-label={`Bet on number ${num}`}
                    >
                        {num}
                    </button>
                ))}

                {/* Bottom Row Numbers */}
                {bottomRowNumbers.map(num => (
                    <button
                        key={num}
                        onClick={() => onBetSelectionChange({ type: BetType.SingleNumber, value: num })}
                        disabled={disabled}
                        className={`${baseButtonClasses} ${hoverClasses} ${getNumberColorClass(num)} ${isSelected(BetType.SingleNumber, num) ? 'ring-2 md:ring-4 ring-amber-300' : 'border-slate-700'}`}
                        aria-label={`Bet on number ${num}`}
                    >
                        {num}
                    </button>
                ))}

                {/* Dozens */}
                <button onClick={() => onBetSelectionChange({type: BetType.Dozen, value: '1st'})} disabled={disabled} className={`col-start-2 col-span-4 ${baseButtonClasses} ${hoverClasses} border-slate-600 bg-slate-700 ${isSelected(BetType.Dozen, '1st') ? 'ring-2 md:ring-4 ring-amber-300' : ''}`}>1st 12</button>
                <button onClick={() => onBetSelectionChange({type: BetType.Dozen, value: '2nd'})} disabled={disabled} className={`col-span-4 ${baseButtonClasses} ${hoverClasses} border-slate-600 bg-slate-700 ${isSelected(BetType.Dozen, '2nd') ? 'ring-2 md:ring-4 ring-amber-300' : ''}`}>2nd 12</button>
                <button onClick={() => onBetSelectionChange({type: BetType.Dozen, value: '3rd'})} disabled={disabled} className={`col-span-4 ${baseButtonClasses} ${hoverClasses} border-slate-600 bg-slate-700 ${isSelected(BetType.Dozen, '3rd') ? 'ring-2 md:ring-4 ring-amber-300' : ''}`}>3rd 12</button>
                
                {/* Colors */}
                <button onClick={() => onBetSelectionChange({type: BetType.RedBlack, value: 'red'})} disabled={disabled} className={`col-start-2 col-span-6 ${baseButtonClasses} ${hoverClasses} bg-red-600 text-white border-slate-600 ${isSelected(BetType.RedBlack, 'red') ? 'ring-2 md:ring-4 ring-amber-300' : ''}`}>RED</button>
                <button onClick={() => onBetSelectionChange({type: BetType.RedBlack, value: 'black'})} disabled={disabled} className={`col-span-6 ${baseButtonClasses} ${hoverClasses} bg-black text-white border-slate-600 ${isSelected(BetType.RedBlack, 'black') ? 'ring-2 md:ring-4 ring-amber-300' : ''}`}>BLACK</button>
            </div>

            {/* --- Betting Controls Content --- */}
            { showBettingControls && (
                 <div className={`${isPanelVersion ? 'border-t-2 border-slate-700 mt-4 pt-4' : 'mt-2'} space-y-2 flex flex-col justify-center`}>
                    <div className="text-xs text-slate-300 text-center bg-slate-700/50 p-2 rounded-md">
                        Selected Bet: <span className="font-bold text-emerald-300">{BET_CONFIG[selectedBet.type].name} - {betValueDisplay}</span>
                        <span className="block text-[11px] text-slate-400">{BET_CONFIG[selectedBet.type].description}</span>
                    </div>

                    <div className="text-center">
                    <p className="text-xs font-medium text-slate-400">Bet Amount</p>
                    <p className="font-mono text-xl md:text-2xl lg:text-3xl font-bold text-emerald-300">${betAmount.toLocaleString()}</p>
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
            )}
        </div>
    );
};

export default RouletteTable;