
import React, { useRef, useEffect } from 'react';
import { GameEvent } from '../types';

interface GameLogProps {
  events: GameEvent[];
}

const GameLog: React.FC<GameLogProps> = ({ events }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="bg-slate-800 p-2 lg:p-6 rounded-lg shadow-lg flex flex-col flex-grow min-h-0">
      <h2 className="text-lg lg:text-xl font-semibold text-slate-300 mb-2 lg:mb-4 border-b border-slate-700 pb-2 shrink-0">Game Log</h2>
      <div ref={logContainerRef} className="flex-grow overflow-y-auto space-y-2 pr-2">
        {events.map((event) => (
          <p key={event.id} className="text-xs lg:text-sm text-slate-300 animate-fade-in">
            {event.text.startsWith('✅') && <span className="text-green-400 mr-2">✅</span>}
            {event.text.startsWith('💥') && <span className="text-red-400 mr-2">💥</span>}
            {event.text.startsWith('🎉') && <span className="text-amber-300 mr-2">🎉</span>}
            <span className={event.text.startsWith('Welcome') ? 'italic text-slate-400' : ''}>
              {event.text.substring(event.text.indexOf(' ')+1)}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default GameLog;
