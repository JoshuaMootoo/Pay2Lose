import React, { useState } from 'react';

interface OnlineMenuScreenProps {
    onCreate: (playerName: string) => void;
    onJoin: (gameId: string, playerName: string) => void;
    onBack: () => void;
}

const OnlineMenuScreen: React.FC<OnlineMenuScreenProps> = ({ onCreate, onJoin, onBack }) => {
    const [view, setView] = useState<'menu' | 'create' | 'join'>('menu');
    const [playerName, setPlayerName] = useState('');
    const [gameId, setGameId] = useState('');

    const handleCreate = () => {
        if (playerName.trim()) {
            onCreate(playerName.trim());
        }
    };

    const handleJoin = () => {
        if (playerName.trim() && gameId.trim()) {
            onJoin(gameId.trim(), playerName.trim());
        }
    };

    if (view === 'create') {
        return (
            <div className="min-h-screen flex items-center justify-center animate-fade-in">
                <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-center text-emerald-400 mb-6">Create Game</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            maxLength={15}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-emerald-500"
                        />
                        <button onClick={handleCreate} disabled={!playerName.trim()} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50">Create</button>
                        <button onClick={() => setView('menu')} className="w-full bg-slate-700 text-slate-300 py-2 rounded-lg hover:bg-slate-600 transition">Back</button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'join') {
        return (
            <div className="min-h-screen flex items-center justify-center animate-fade-in">
                <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-center text-cyan-400 mb-6">Join Game</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter Game Code"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-cyan-500"
                        />
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            maxLength={15}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-cyan-500"
                        />
                        <button onClick={handleJoin} disabled={!playerName.trim() || !gameId.trim()} className="w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 transition disabled:opacity-50">Join</button>
                        <button onClick={() => setView('menu')} className="w-full bg-slate-700 text-slate-300 py-2 rounded-lg hover:bg-slate-600 transition">Back</button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen flex items-center justify-center animate-fade-in p-4">
            <div className="w-full max-w-sm text-center">
                <h2 className="text-4xl font-bold text-slate-200 mb-8">Online Multiplayer</h2>
                <div className="space-y-4">
                    <button onClick={() => setView('create')} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-lg text-xl hover:from-emerald-600 hover:to-green-700 transition">Create Game</button>
                    <button onClick={() => setView('join')} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-lg text-xl hover:from-cyan-600 hover:to-blue-700 transition">Join Game</button>
                    <button onClick={onBack} className="w-full bg-slate-700 text-slate-300 py-3 rounded-lg hover:bg-slate-600 transition mt-4">Back to Menu</button>
                </div>
                <p className="text-xs text-slate-500 mt-8">
                    Note: Online multiplayer uses a free, third-party service (jsonblob.com) for game state synchronization. This may be blocked in certain restricted network environments.
                </p>
            </div>
        </div>
    );
};

export default OnlineMenuScreen;