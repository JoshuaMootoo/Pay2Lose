import React, { useState, useEffect, useRef } from 'react';
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
  const wheelRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0); // Start with 0 to avoid flash of incorrect size

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

  useEffect(() => {
    const element = wheelRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      setSize(Math.min(element.offsetWidth, element.offsetHeight));
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  // Base calculations on the dynamic `size`
  const wheelRadius = size / 2 * 0.85; // Use 85% of radius for number circle

  return (
    <div ref={wheelRef} className="relative w-full h-full mx-auto flex-shrink-0 flex items-center justify-center">
      {/* Outer wheel, now sized with the 'size' state to guarantee it's a circle */}
      <div 
        className="absolute rounded-full bg-slate-700 shadow-inner"
        style={{ width: `${size}px`, height: `${size}px` }}
      ></div>
      {/* Inner wheel, also sized with 'size' state */}
      <div 
        className="absolute rounded-full bg-slate-800 border-4 border-slate-600"
        style={{ width: `${size * 0.9}px`, height: `${size * 0.9}px` }}
      ></div>
      
      {/* Numbers */}
      {NUMBERS.map((num) => {
        const angle = (num * 360) / NUMBERS.length;
        const x = wheelRadius * Math.cos((angle - 90) * (Math.PI / 180));
        const y = wheelRadius * Math.sin((angle - 90) * (Math.PI / 180));

        const isHighlighted = highlightedNumber === num;
        const pocketSize = size * 0.09; // e.g., ~20px for 224px size
        const fontSize = size * 0.055; // e.g., ~12px for 224px size

        return (
          <div
            key={num}
            className={`absolute flex items-center justify-center rounded-full text-white font-bold transition-all duration-75
              ${getNumberColor(num)}
              ${isHighlighted ? 'scale-150 ring-2 md:ring-4 ring-amber-300 z-10' : ''}`}
            style={{
              width: `${pocketSize}px`,
              height: `${pocketSize}px`,
              fontSize: `${fontSize}px`,
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            {num}
          </div>
        );
      })}
      
      {/* Center Pot Display */}
      <div 
        className="relative z-20 bg-slate-900/70 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-slate-700"
        style={{
            width: `${size * 0.7}px`, // 70% of total size
            height: `${size * 0.7}px`,
        }}
      >
        <PotDisplay amount={potAmount} />
      </div>
    </div>
  );
};

export default RouletteWheel;