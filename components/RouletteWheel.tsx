
import React, { useState, useEffect } from 'react';
import { ROULETTE_NUMBERS } from '../constants';
import PotDisplay from './PotDisplay';

interface RouletteWheelProps {
  isSpinning: boolean;
  winningNumber: number | null;
  potAmount: number;
}

const NUMBERS = Array.from({ length: 37 }, (_, i) => i); // 0-36

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

  const wheelRadius = 64; // smaller for mobile
  const pocketSize = 16; // smaller for mobile

  return (
    <div className="relative w-36 h-36 lg:w-64 lg:h-64 mx-auto flex-shrink-0 flex items-center justify-center">
      {/* Outer wheel */}
      <div className="absolute w-full h-full rounded-full bg-slate-700 shadow-inner"></div>
      {/* Inner wheel */}
      <div className="absolute w-[90%] h-[90%] rounded-full bg-slate-800 border-4 border-slate-600"></div>
      
      {/* Numbers */}
      {NUMBERS.map((num) => {
        const angle = (num * 360) / NUMBERS.length;
        const x = wheelRadius * Math.cos((angle - 90) * (Math.PI / 180));
        const y = wheelRadius * Math.sin((angle - 90) * (Math.PI / 180));

        const isHighlighted = highlightedNumber === num;

        return (
          <div
            key={num}
            className={`absolute flex items-center justify-center rounded-full text-white font-bold text-[8px] lg:text-sm transition-all duration-75
              ${getNumberColor(num)}
              ${isHighlighted ? 'scale-150 ring-2 lg:ring-4 ring-amber-300 z-10' : ''}`}
            style={{
              width: `${pocketSize}px`,
              height: `${pocketSize}px`,
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            {num}
          </div>
        );
      })}
      
      {/* Center Pot Display */}
      <div className="relative z-20 w-24 h-24 lg:w-40 lg:h-40 bg-slate-900/70 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-slate-700">
        <PotDisplay amount={potAmount} />
      </div>
    </div>
  );
};

export default RouletteWheel;
