import React, { useState, useEffect } from 'react';
import { ROULETTE_NUMBERS } from '../constants';
import PotDisplay from './PotDisplay';

interface RouletteWheelProps {
  isSpinning: boolean;
  winningNumber: number | null;
  potAmount: number;
}

const NUMBERS = Array.from({ length: 37 }, (_, i) => i); // 0-36
const WHEEL_RADIUS = 120; // in pixels
const POCKET_SIZE = 30; // in pixels

const getNumberColor = (num: number) => {
  if (ROULETTE_NUMBERS.red.includes(num)) return 'bg-red-700';
  if (ROULETTE_NUMBERS.black.includes(num)) return 'bg-slate-900';
  return 'bg-green-600';
};

const RouletteWheel: React.FC<RouletteWheelProps> = ({ isSpinning, winningNumber, potAmount }) => {
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);

  useEffect(() => {
    let animationInterval: number | undefined;

    if (isSpinning) {
      animationInterval = window.setInterval(() => {
        setHighlightedNumber(Math.floor(Math.random() * 37));
      }, 80);
    } else {
      setHighlightedNumber(winningNumber);
    }

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [isSpinning, winningNumber]);

  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
      {/* Outer wheel */}
      <div className="absolute w-full h-full rounded-full bg-slate-700 shadow-inner"></div>
      {/* Inner wheel */}
      <div className="absolute w-[90%] h-[90%] rounded-full bg-slate-800 border-4 border-slate-600"></div>
      
      {/* Numbers */}
      {NUMBERS.map((num) => {
        const angle = (num * 360) / NUMBERS.length;
        const x = WHEEL_RADIUS * Math.cos((angle - 90) * (Math.PI / 180));
        const y = WHEEL_RADIUS * Math.sin((angle - 90) * (Math.PI / 180));

        const isHighlighted = highlightedNumber === num;

        return (
          <div
            key={num}
            className={`absolute flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm transition-all duration-75
              ${getNumberColor(num)}
              ${isHighlighted ? 'scale-150 ring-4 ring-amber-300 z-10' : ''}`}
            style={{
              width: `${POCKET_SIZE}px`,
              height: `${POCKET_SIZE}px`,
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            {num}
          </div>
        );
      })}
      
      {/* Center Pot Display */}
      <div className="relative z-20 w-40 h-40 bg-slate-900/70 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-slate-700">
        <PotDisplay amount={potAmount} />
      </div>
    </div>
  );
};

export default RouletteWheel;
