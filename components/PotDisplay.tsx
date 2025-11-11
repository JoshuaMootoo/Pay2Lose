import React from 'react';

interface PotDisplayProps {
  amount: number;
}

const PotDisplay: React.FC<PotDisplayProps> = ({ amount }) => {
  return (
    <div className="text-center">
      <h2 className="text-[10px] md:text-sm lg:text-base font-semibold text-slate-400 uppercase tracking-wider">Current Pot</h2>
      <p className="text-xl md:text-3xl lg:text-4xl font-bold font-mono text-amber-400 mt-1">
        ${amount.toLocaleString()}
      </p>
    </div>
  );
};

export default PotDisplay;