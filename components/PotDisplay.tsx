
import React from 'react';

interface PotDisplayProps {
  amount: number;
}

const PotDisplay: React.FC<PotDisplayProps> = ({ amount }) => {
  return (
    <div className="text-center">
      <h2 className="text-[10px] lg:text-base font-semibold text-slate-400 uppercase tracking-wider">Current Pot</h2>
      <p className="text-xl lg:text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-orange-500 mt-1">
        ${amount.toLocaleString()}
      </p>
    </div>
  );
};

export default PotDisplay;
