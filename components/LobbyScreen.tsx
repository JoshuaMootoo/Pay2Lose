import React from 'react';
import { OnlineGameState } from '../types';

interface LobbyScreenProps {
    gameId: string;
    onlineState: OnlineGameState;
    isHost: boolean;
    onStartGame: () => void;
    onQuit: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ gameId, onlineState, isHost, onStartGame, onQuit }) => {

    const handleCopy = () => {
        navigator.clipboard.writeText(gameId)
            .then(() => alert('Game Code copied to clipboard!'))
            .catch(() => alert('Could not copy code.'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center animate-fade-in p-4">
            <div className="bg-slate-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4">
                    Game Lobby
                </h2>
                
                <div className="bg-slate-900/50 p-3 rounded-md text-center mb-6">
                    <p className="text-sm text-slate-400">Share this code with your friends:</p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                        <p className="text-2xl font-mono font-bold text-amber-300 tracking-widest">{gameId}</p>
                        <button onClick={handleCopy} className="bg-slate-700 hover:bg-slate-600 text-xs py-1 px-3 rounded-md transition">Copy</button>
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-slate-300 mb-3">Players ({onlineState.players.length}/10)</h3>
                <div className="space-y-2 bg-slate-700/50 p-4 rounded-md h-48 overflow-y-auto">
                    {onlineState.players.map(player => (
                        <div key={player.id} className="flex justify-between items-center bg-slate-800 p-2 rounded-md">
                            <p className="font-medium text-slate-200">{player.name}</p>
                            {player.id === onlineState.hostId && <span className="text-xs font-bold text-amber-400">HOST</span>}
                        </div>
                    ))}
                </div>

                <div className="mt-6 space-y-3">
                    {isHost ? (
                        <button 
                            onClick={onStartGame} 
                            disabled={onlineState.players.length < 2}
                            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                Start Game ({onlineState.players.length}/10)
                        </button>
                    ) : (
                        <p className="text-center text-slate-400 italic">Waiting for host to start the game...</p>
                    )}
                     <button onClick={onQuit} className="w-full bg-slate-700 text-slate-300 py-2 rounded-lg hover:bg-slate-600 transition">Leave Lobby</button>
                </div>
            </div>
        </div>
    );
};

export default LobbyScreen;
