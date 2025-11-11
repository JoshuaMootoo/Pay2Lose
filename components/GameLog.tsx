import React, { useRef, useEffect } from 'react';
import { GameEvent } from '../types';
import { ExpandIcon, CloseIcon } from './icons/UIcons';

interface GameLogProps {
  events: GameEvent[];
  className?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const GameLog: React.FC<GameLogProps> = ({ events, className, isExpanded, onToggleExpand }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const lastEvent = events.length > 0 ? events[events.length - 1] : null;

  useEffect(() => {
    if (isExpanded && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events, isExpanded]);

  const renderEventText = (event: GameEvent) => (
    <>
      {event.text.startsWith('✅') && <span className="text-green-400 mr-2 shrink-0">✅</span>}
      {event.text.startsWith('💥') && <span className="text-red-400 mr-2 shrink-0">💥</span>}
      {event.text.startsWith('🎉') && <span className="text-amber-300 mr-2 shrink-0">🎉</span>}
      <span className={`truncate ${event.text.startsWith('Welcome') ? 'italic text-slate-400' : ''}`}>
        {event.text.substring(event.text.indexOf(' ') + 1)}
      </span>
    </>
  );

  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-slate-800 border border-slate-700 p-4 md:p-6 rounded-lg shadow-2xl flex flex-col h-full max-h-[90vh] w-full max-w-2xl animate-fade-in-up">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-300">Game Log</h2>
            <button onClick={onToggleExpand} className="text-slate-400 hover:text-white transition-colors" aria-label="Close Log">
              <CloseIcon className="h-8 w-8" />
            </button>
          </div>
          <div ref={logContainerRef} className="flex-grow overflow-y-auto space-y-2 pr-2">
            {events.map((event) => (
              <p key={event.id} className="text-sm md:text-base text-slate-300 flex items-center">
                {renderEventText(event)}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800 p-2 rounded-lg shadow-lg flex items-center justify-between gap-4 ${className || ''}`}>
       <div className="flex items-center min-w-0">
         {lastEvent ? (
          <p className="text-xs md:text-sm text-slate-300 flex items-center min-w-0">
            {renderEventText(lastEvent)}
          </p>
        ) : (
          <p className="text-xs md:text-sm italic text-slate-400">Log is empty.</p>
        )}
       </div>
      <button onClick={onToggleExpand} className="bg-slate-700 hover:bg-slate-600 rounded-md p-1 text-slate-300 hover:text-white transition-colors shrink-0" aria-label="Expand Log">
        <ExpandIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default GameLog;