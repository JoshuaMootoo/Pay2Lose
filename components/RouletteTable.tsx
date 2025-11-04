
import React from 'react';
import { BetType } from '../types';
import { ROULETTE_NUMBERS } from '../constants';

interface RouletteTableProps {
  selectedBet: { type: BetType; value: any };
  onBetSelectionChange: (bet: { type: BetType; value: any }) => void;
  disabled: boolean;
}

const getNumberColorClass = (num: number) => {
  if (ROULETTE_NUMBERS.red.includes(num)) return 'bg-red-700 text-white';
  if (ROULETTE_NUMBERS.black.includes(num)) return 'bg-slate-900 text-white';
  return 'bg-green-600 text-white'; // for 0
};

const RouletteTable: React.FC<RouletteTableProps> = ({ selectedBet, onBetSelectionChange, disabled }) => {
    
    const baseButtonClasses = `transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 text-xs sm:text-sm font-bold rounded-md flex items-center justify-center h-10`;
    const hoverClasses = !disabled ? 'hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-800 hover:ring-amber-300/70' : '';

    const isSelected = (type: BetType, value: any) => selectedBet.type === type && selectedBet.value === value;

    const renderNumberButtons = (row: 'top' | 'middle' | 'bottom') => {
        let numbers: number[] = [];
        if (row === 'top') numbers = Array.from({ length: 12 }, (_, i) => (i + 1) * 3);
        if (row === 'middle') numbers = Array.from({ length: 12 }, (_, i) => i * 3 + 2);
        if (row === 'bottom') numbers = Array.from({ length: 12 }, (_, i) => i * 3 + 1);
        
        return numbers.map(num => (
            <button
                key={num}
                onClick={() => onBetSelectionChange({ type: BetType.SingleNumber, value: num })}
                disabled={disabled}
                className={`${baseButtonClasses} ${hoverClasses} ${getNumberColorClass(num)} ${isSelected(BetType.SingleNumber, num) ? 'ring-4 ring-amber-300' : 'border-slate-700'}`}
                aria-label={`Bet on number ${num}`}
            >
                {num}
            </button>
        ));
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg w-full max-w-xl mx-auto text-center font-sans">
            <h3 className="text-lg font-semibold text-slate-300 mb-3">Choose Bet Type</h3>
            
            <div className="grid grid-cols-[60px_1fr] gap-2">
                {/* Zero */}
                <button
                    onClick={() => onBetSelectionChange({ type: BetType.SingleNumber, value: 0 })}
                    disabled={disabled}
                    className={`h-full ${baseButtonClasses} ${hoverClasses} ${getNumberColorClass(0)} ${isSelected(BetType.SingleNumber, 0) ? 'ring-4 ring-amber-300' : 'border-slate-700'}`}
                    aria-label="Bet on 0"
                >
                    0
                </button>

                {/* Main numbers grid */}
                <div className="grid grid-rows-3 gap-1">
                    <div className="grid grid-cols-12 gap-1">{renderNumberButtons('top')}</div>
                    <div className="grid grid-cols-12 gap-1">{renderNumberButtons('middle')}</div>
                    <div className="grid grid-cols-12 gap-1">{renderNumberButtons('bottom')}</div>
                </div>
            </div>

            {/* Dozens */}
            <div className="grid grid-cols-[60px_1fr] gap-2 mt-2">
                <div></div> {/* Spacer */}
                <div className="grid grid-cols-3 gap-1">
                    <button onClick={() => onBetSelectionChange({type: BetType.Dozen, value: '1st'})} disabled={disabled} className={`py-2 px-1 ${baseButtonClasses} ${hoverClasses} border-slate-600 bg-slate-700 ${isSelected(BetType.Dozen, '1st') ? 'ring-4 ring-amber-300' : ''}`}>1st 12</button>
                    <button onClick={() => onBetSelectionChange({type: BetType.Dozen, value: '2nd'})} disabled={disabled} className={`py-2 px-1 ${baseButtonClasses} ${hoverClasses} border-slate-600 bg-slate-700 ${isSelected(BetType.Dozen, '2nd') ? 'ring-4 ring-amber-300' : ''}`}>2nd 12</button>
                    <button onClick={() => onBetSelectionChange({type: BetType.Dozen, value: '3rd'})} disabled={disabled} className={`py-2 px-1 ${baseButtonClasses} ${hoverClasses} border-slate-600 bg-slate-700 ${isSelected(BetType.Dozen, '3rd') ? 'ring-4 ring-amber-300' : ''}`}>3rd 12</button>
                </div>
            </div>
            
            {/* Colors */}
            <div className="grid grid-cols-[60px_1fr] gap-2 mt-1">
                <div></div> {/* Spacer */}
                <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => onBetSelectionChange({type: BetType.RedBlack, value: 'red'})} disabled={disabled} className={`py-2 px-1 ${baseButtonClasses} ${hoverClasses} bg-red-700 text-white border-slate-600 ${isSelected(BetType.RedBlack, 'red') ? 'ring-4 ring-amber-300' : ''}`}>RED</button>
                    <button onClick={() => onBetSelectionChange({type: BetType.RedBlack, value: 'black'})} disabled={disabled} className={`py-2 px-1 ${baseButtonClasses} ${hoverClasses} bg-slate-900 text-white border-slate-600 ${isSelected(BetType.RedBlack, 'black') ? 'ring-4 ring-amber-300' : ''}`}>BLACK</button>
                </div>
            </div>
        </div>
    );
};

export default RouletteTable;
