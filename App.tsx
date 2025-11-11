import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, BetType, GameEvent, AIPersonality, OnlineGameState, GameAction } from './types';
import { INITIAL_PLAYERS, STARTING_BALANCE, POT_STARTING_AMOUNT, BET_CONFIG, ROULETTE_NUMBERS } from './constants';
import PlayerCard from './components/PlayerCard';
import GameLog from './components/GameLog';
import GameOverModal from './components/GameOverModal';
import RouletteWheel from './components/RouletteWheel';
import RouletteTable from './components/RouletteTable';
import TitleScreen from './components/TitleScreen';
import PauseModal from './components/PauseModal';
import OnlineMenuScreen from './components/OnlineMenuScreen';
import LobbyScreen from './components/LobbyScreen';
import SetupScreen from './components/SetupScreen';
import { PauseIcon } from './components/icons/UIcons';

const isRed = (num: number) => ROULETTE_NUMBERS.red.includes(num);
const JSONBLOB_API = 'https://api.jsonblob.com';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'title' | 'setup' | 'online-menu' | 'lobby' | 'playing' | 'paused'>('title');
  const [localGameState, setLocalGameState] = useState<{players: Player[], pot: number}>({ players: [], pot: POT_STARTING_AMOUNT });
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [gameLog, setGameLog] = useState<GameEvent[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<{ type: BetType; value: any }>({ type: BetType.SingleNumber, value: 0 });
  const [isLogExpanded, setIsLogExpanded] = useState(false);


  // Online state
  const [onlineState, setOnlineState] = useState<OnlineGameState | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const isOnlineGame = !!gameId;

  const eventIdCounter = useRef(0);
  const pollingIntervalRef = useRef<number | null>(null);
  const pollFailures = useRef(0);

  const addLog = useCallback((text: string, logSetter: React.Dispatch<React.SetStateAction<GameEvent[]>>) => {
    logSetter(prevLog => [...prevLog, { id: eventIdCounter.current++, text }]);
  }, []);

  const resetLocalGame = useCallback((initialPlayers: Player[]) => {
    setLocalGameState({
      players: initialPlayers.map(p => ({ ...p, balance: STARTING_BALANCE })),
      pot: POT_STARTING_AMOUNT
    });
    setCurrentPlayerIndex(0);
    setGameLog([]);
    setWinner(null);
    setIsSpinning(false);
    setWinningNumber(null);
    eventIdCounter.current = 0;
    addLog("Welcome to Reverse Roulette! The first to $0 wins.", setGameLog);
  }, [addLog]);

  const advanceTurn = useCallback((players: Player[]) => {
    if (winner) return -1;
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    for (let i = 0; i < players.length; i++) {
      if (players[nextIndex].balance > 0) {
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % players.length;
    }
    return currentPlayerIndex;
  }, [currentPlayerIndex, winner]);

  const processTurn = useCallback((player: Player, bet: { type: BetType; value: any }, amount: number, currentPlayers: Player[], currentPot: number, currentLog: GameEvent[]): { updatedPlayers: Player[], newPot: number, newWinner: Player | null, newLog: GameEvent[] } => {
    let log: GameEvent[] = [...currentLog];
    const add = (text: string) => { log = [...log, { id: eventIdCounter.current++, text }] };

    let betDescription = '';
    switch (bet.type) {
      case BetType.SingleNumber: betDescription = `Single Number (${bet.value})`; break;
      case BetType.Dozen: betDescription = `${bet.value} Dozen`; break;
      case BetType.RedBlack: betDescription = `${(bet.value as string).toUpperCase()}`; break;
    }
    add(`${player.name} bets $${amount} on ${betDescription}.`);

    const resultNumber = Math.floor(Math.random() * 37);

    let isWin = false;
    switch (bet.type) {
      case BetType.SingleNumber: isWin = resultNumber === bet.value; break;
      case BetType.Dozen:
        if (bet.value === '1st') isWin = resultNumber >= 1 && resultNumber <= 12;
        else if (bet.value === '2nd') isWin = resultNumber >= 13 && resultNumber <= 24;
        else if (bet.value === '3rd') isWin = resultNumber >= 25 && resultNumber <= 36;
        break;
      case BetType.RedBlack:
        if (bet.value === 'red') isWin = isRed(resultNumber);
        else if (bet.value === 'black') isWin = ROULETTE_NUMBERS.black.includes(resultNumber);
        break;
    }

    const color = isRed(resultNumber) ? '(Red)' : ROULETTE_NUMBERS.black.includes(resultNumber) ? '(Black)' : '(Green)';
    add(`The ball lands on ${resultNumber} ${color}!`);

    let newBalance: number;
    let newPot = currentPot;
    if (isWin) {
      add(`💥 Oh no! ${player.name} wins the spin! They take the pot of $${currentPot} and get their $${amount} bet back.`);
      newBalance = player.balance + currentPot;
      newPot = 0;
    } else {
      add(`✅ Success! ${player.name} loses the spin. Their $${amount} bet is added to the pot.`);
      newBalance = player.balance - amount;
      newPot += amount;
    }

    const updatedPlayers = currentPlayers.map(p => p.id === player.id ? { ...p, balance: newBalance } : p);
    let newWinner: Player | null = null;
    if (newBalance <= 0) {
      const gameWinner = { ...player, balance: 0 };
      newWinner = gameWinner;
      add(`🎉 ${player.name} has hit zero! They are the WINNER!`);
    }
    
    setWinningNumber(resultNumber);

    return { updatedPlayers, newPot, newWinner, newLog: log };
  }, []);

  const handleLocalBet = (amount: number) => {
    const player = localGameState.players[currentPlayerIndex];
    setIsSpinning(true);
    setTimeout(() => {
      const { updatedPlayers, newPot, newWinner, newLog } = processTurn(player, selectedBet, amount, localGameState.players, localGameState.pot, gameLog);
      setLocalGameState({ players: updatedPlayers, pot: newPot });
      setGameLog(newLog);
      if (newWinner) {
        setWinner(newWinner);
      } else {
        setCurrentPlayerIndex(advanceTurn(updatedPlayers));
      }
      setIsSpinning(false);
    }, 2500);
  };

  const determineAIBet = useCallback((player: Player): { bet: { type: BetType; value: any }; amount: number } => {
    let betType: BetType; let betValue: any; const rand = Math.random();
    switch (player.personality) {
      case AIPersonality.RiskLover: betType = rand < 0.9 ? BetType.SingleNumber : BetType.Dozen; break;
      case AIPersonality.AccidentProne: betType = rand < 0.8 ? BetType.RedBlack : BetType.Dozen; break;
      default:
        if (rand < 0.2) betType = BetType.SingleNumber;
        else if (rand < 0.7) betType = BetType.Dozen;
        else betType = BetType.RedBlack;
        break;
    }
    switch (betType) {
      case BetType.SingleNumber: betValue = Math.floor(Math.random() * 37); break;
      case BetType.Dozen: const dozens = ['1st', '2nd', '3rd']; betValue = dozens[Math.floor(Math.random() * 3)]; break;
      case BetType.RedBlack: betValue = Math.random() < 0.5 ? 'red' : 'black'; break;
    }
    const maxBetForType = BET_CONFIG[betType].maxBet;
    const amount = Math.min(player.balance, maxBetForType);
    return { bet: { type: betType, value: betValue }, amount };
  }, []);

  useEffect(() => {
    if (isOnlineGame || localGameState.players.length === 0) return;
    const currentPlayer = localGameState.players[currentPlayerIndex];
    if (gameState === 'playing' && currentPlayer?.isAI && !isSpinning && !winner) {
      const { bet, amount } = determineAIBet(currentPlayer);
      setTimeout(() => {
        // AI needs to select the bet before placing it
        setSelectedBet(bet);
        handleLocalBet(amount);
      }, 1000);
    }
  }, [currentPlayerIndex, localGameState.players, isSpinning, winner, determineAIBet, gameState, handleLocalBet, isOnlineGame]);


  const handleQuitToMenu = useCallback(() => {
    if(pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = null;
    pollFailures.current = 0;
    setGameState('title');
    setGameId(null);
    setOnlineState(null);
    setIsHost(false);
    setPlayerId(null);
    setPlayerName(null);
    setWinner(null);
    setIsSpinning(false);
    setLocalGameState({ players: [], pot: POT_STARTING_AMOUNT });
  }, []);

  // Online Logic
  const updateOnlineState = useCallback(async (newState: OnlineGameState, specificGameId?: string) => {
    const id = specificGameId || gameId;
    if (!id) return;
    try {
      await fetch(`${JSONBLOB_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      });
      setOnlineState(newState);
    } catch (error) {
      console.error("Failed to update game state:", error);
      alert("Error: Could not sync game state with the server.");
    }
  }, [gameId]);

  const pollGameState = useCallback(async () => {
    if (!gameId) return;
    try {
      const response = await fetch(`${JSONBLOB_API}/${gameId}`);
      if (!response.ok) throw new Error(`Game not found or server error (${response.status})`);
      const data: OnlineGameState = await response.json();
      
      pollFailures.current = 0;

      if (isHost) { // Host processes actions
        if (data.guestActions.length > 0) {
          let stateChanged = false;
          let tempState = { ...data };
          const processedActionIds = new Set<string>();
          
          for (const action of data.guestActions) {
             if (processedActionIds.has(action.actionId)) continue;
             processedActionIds.add(action.actionId);

            if (action.type === 'JOIN') {
              const newPlayerId = tempState.players.length > 0 ? Math.max(...tempState.players.map(p => p.id)) + 1 : 1;
              tempState.players.push({
                id: newPlayerId,
                name: action.payload.name,
                balance: STARTING_BALANCE,
                isAI: false,
              });
              stateChanged = true;
            } else if (action.type === 'BET' && tempState.status === 'playing' && tempState.players[tempState.currentPlayerIndex]?.id === action.playerId) {
               const player = tempState.players.find(p => p.id === action.playerId);
               if(player) {
                  setIsSpinning(true);
                  setTimeout(() => {
                    const { updatedPlayers, newPot, newWinner, newLog } = processTurn(player, action.payload.bet, action.payload.amount, tempState.players, tempState.pot, tempState.gameLog);
                    const nextPlayerIndex = newWinner ? tempState.currentPlayerIndex : advanceTurn(updatedPlayers);
                    const finalState: OnlineGameState = {
                      ...tempState,
                      players: updatedPlayers,
                      pot: newPot,
                      gameLog: newLog,
                      status: newWinner ? 'finished' : 'playing',
                      winningNumber: winningNumber, // Make sure to sync winning number
                      currentPlayerIndex: nextPlayerIndex,
                      guestActions: [],
                      version: tempState.version + 1,
                    };
                    updateOnlineState(finalState);
                    setIsSpinning(false);
                  }, 2500);
                  return; // Stop processing further state changes until spin is done
               }
            }
          }
          if(stateChanged) {
            tempState.guestActions = [];
            tempState.version += 1;
            updateOnlineState(tempState);
          } else {
             setOnlineState(data);
          }

        } else {
            setOnlineState(data);
        }
      } else { // Guests just receive state
        setOnlineState(data);
      }
    } catch (error) {
      pollFailures.current += 1;
      console.error(`Failed to fetch game state (attempt ${pollFailures.current}):`, error);
      if (pollFailures.current >= 5) {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        alert("Lost connection to game after multiple attempts.");
        handleQuitToMenu();
      }
    }
  }, [gameId, isHost, processTurn, updateOnlineState, advanceTurn, handleQuitToMenu, winningNumber]);


  useEffect(() => {
    if (gameId && (gameState === 'lobby' || gameState === 'playing')) {
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = window.setInterval(pollGameState, 3000);
      }
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [gameId, gameState, pollGameState]);

  useEffect(() => {
    if (onlineState?.status === 'playing' && gameState !== 'playing') {
        setGameState('playing');
    }
    if(onlineState?.status === 'finished') {
        const winnerPlayer = onlineState.players.find(p => p.balance <= 0);
        if(winnerPlayer) setWinner(winnerPlayer);
    } else {
        setWinner(null);
    }
    if(onlineState) {
        setWinningNumber(onlineState.winningNumber);
        setCurrentPlayerIndex(onlineState.currentPlayerIndex);
    }
  }, [onlineState, gameState]);
  
  useEffect(() => {
    // When playing online as a guest, we need to discover our own ID,
    // which is assigned by the host.
    if (isOnlineGame && !isHost && !playerId && onlineState?.players && playerName) {
        const me = onlineState.players.find(p => p.name === playerName);
        if (me) {
            setPlayerId(me.id);
        }
    }
  }, [isOnlineGame, isHost, playerId, onlineState, playerName]);

  const handleStartSinglePlayer = () => {
    resetLocalGame(INITIAL_PLAYERS);
    setGameState('playing');
  };

  const handleGoToSetup = () => {
    setGameState('setup');
  };

  const handleSetupComplete = (playerNames: string[]) => {
    const newPlayers: Player[] = playerNames.map((name, index) => ({
      id: index + 1,
      name,
      balance: STARTING_BALANCE,
      isAI: false,
    }));
    resetLocalGame(newPlayers);
    setGameState('playing');
  };

  const handleGoToOnlineMenu = () => setGameState('online-menu');
  
  const handleCreateGame = async (playerName: string) => {
    setIsLoading('Creating game...');
    setPlayerName(playerName);
    const newPlayerId = 1;
    const initialState: OnlineGameState = {
      hostId: newPlayerId,
      status: 'lobby',
      players: [{ id: newPlayerId, name: playerName, balance: STARTING_BALANCE, isAI: false }],
      pot: POT_STARTING_AMOUNT,
      currentPlayerIndex: 0,
      gameLog: [{id: eventIdCounter.current++, text: 'Game lobby created.'}],
      winningNumber: null,
      guestActions: [],
      version: 1,
    };
    try {
      const response = await fetch(JSONBLOB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(initialState),
      });
      if (!response.ok) throw new Error('Failed to create game on server.');
      const location = response.headers.get('Location');
      if (!location) throw new Error('Could not get game ID from server.');
      const newGameId = location.split('/').pop()!;
      pollFailures.current = 0;
      setGameId(newGameId);
      setPlayerId(newPlayerId);
      setIsHost(true);
      setOnlineState(initialState);
      setGameState('lobby');
    } catch (error) {
      alert(`Error creating game: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPlayerName(null);
    } finally {
      setIsLoading(null);
    }
  };

  const handleJoinGame = async (joinGameId: string, playerName: string) => {
    setIsLoading('Joining game...');
    setPlayerName(playerName);
    try {
      const response = await fetch(`${JSONBLOB_API}/${joinGameId}`);
      if (!response.ok) throw new Error("Game not found.");
      const data: OnlineGameState = await response.json();
      if (data.status !== 'lobby') throw new Error("Game has already started.");
      if (data.players.find(p => p.name === playerName)) throw new Error("That name is already taken.");
      
      const joinAction: GameAction = {
        actionId: crypto.randomUUID(),
        playerId: -1,
        type: 'JOIN',
        payload: { name: playerName },
      };
      
      const updatedData = { ...data, guestActions: [...data.guestActions, joinAction] };
      
      await updateOnlineState(updatedData, joinGameId);
      
      pollFailures.current = 0;
      setGameId(joinGameId);
      setIsHost(false);
      setOnlineState(updatedData); // Optimistically set state
      setGameState('lobby');

    } catch (error) {
      alert(`Error joining game: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPlayerName(null);
    } finally {
      setIsLoading(null);
    }
  };

  const handleStartOnlineGame = async () => {
    if (!isHost || !onlineState) return;
    const newState = { ...onlineState, status: 'playing' as const, version: onlineState.version + 1, gameLog: [...onlineState.gameLog, {id: eventIdCounter.current++, text: `Game started with ${onlineState.players.length} players.`}]};
    await updateOnlineState(newState);
  };
  
  const handleOnlineBet = async (amount: number) => {
    if (!onlineState || !playerId) return;
    const betAction: GameAction = {
        actionId: crypto.randomUUID(),
        playerId,
        type: 'BET',
        payload: { bet: selectedBet, amount }
    };
    const newState = { ...onlineState, guestActions: [...onlineState.guestActions, betAction]};
    await updateOnlineState(newState);
  };


  const handleRestart = () => {
    if (isOnlineGame) {
        if (!isHost || !onlineState) return;
        const newPlayers = onlineState.players.map(p => ({...p, balance: STARTING_BALANCE}));
        const newState: OnlineGameState = {
            ...onlineState,
            status: 'lobby',
            players: newPlayers,
            pot: POT_STARTING_AMOUNT,
            currentPlayerIndex: 0,
            gameLog: [{id: 0, text: 'New game started!'}],
            winningNumber: null,
            guestActions: [],
            version: onlineState.version + 1,
        };
        eventIdCounter.current = 1;
        updateOnlineState(newState);
        setGameState('lobby');
    } else {
        resetLocalGame(localGameState.players);
        setGameState('playing');
    }
  };

  const handlePause = () => setGameState('paused');
  const handleResume = () => setGameState('playing');

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center text-xl">{isLoading}</div>;
  }
  
  if (gameState === 'title') {
    return <TitleScreen onStartSinglePlayer={handleStartSinglePlayer} onStartLocalMultiplayer={handleGoToSetup} onStartOnlineMultiplayer={handleGoToOnlineMenu} />;
  }

  if (gameState === 'setup') {
    return <SetupScreen onGameSetupComplete={handleSetupComplete} onBack={handleQuitToMenu} />;
  }
  
  if (gameState === 'online-menu') {
    return <OnlineMenuScreen onCreate={handleCreateGame} onJoin={handleJoinGame} onBack={handleQuitToMenu} />
  }

  if (gameState === 'lobby' && onlineState) {
    return <LobbyScreen gameId={gameId!} onlineState={onlineState} isHost={isHost} onStartGame={handleStartOnlineGame} onQuit={handleQuitToMenu} />
  }

  const players = isOnlineGame && onlineState ? onlineState.players : localGameState.players;
  const pot = isOnlineGame && onlineState ? onlineState.pot : localGameState.pot;
  const currentLog = isOnlineGame && onlineState ? onlineState.gameLog : gameLog;
  
  if (players.length === 0) {
    if (gameState === 'playing') {
       handleQuitToMenu(); // Failsafe if we end up in a playing state with no players
    }
    return null;
  }

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = isOnlineGame ? currentPlayer?.id === playerId : !currentPlayer?.isAI;
  const canBet = gameState === 'playing' && isMyTurn && !isSpinning && !winner;

  return (
    <div className="h-screen max-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col overflow-hidden p-2 md:p-4">
      {winner && <GameOverModal winner={winner} onRestart={handleRestart} onBackToMenu={handleQuitToMenu} isOnline={isOnlineGame} isHost={isHost} />}
      {gameState === 'paused' && <PauseModal onResume={handleResume} onQuit={handleQuitToMenu} />}

      <header className="relative text-center shrink-0 p-1">
        <button onClick={handlePause} className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors z-30" aria-label="Pause game">
          <PauseIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl lg:text-3xl font-bold text-emerald-400">
          Reverse Roulette
        </h1>
        <p className="text-slate-400 text-xs lg:text-sm">The goal is to go broke. Don't win!</p>
      </header>
      
      <div className="flex-grow min-h-0 relative">
        {/* --- Mobile Layout (<768px) --- */}
        <main className="absolute inset-0 flex flex-col gap-2 md:hidden">
          {/* Players */}
          <div className="shrink-0 p-1">
             <h2 className="sr-only">Players</h2>
             <div className="flex flex-row gap-2 overflow-x-auto">
              {players.map((player, index) => (
                <PlayerCard key={player.id} player={player} isCurrent={index === currentPlayerIndex && !winner} />
              ))}
            </div>
          </div>

          <div className="flex-grow grid grid-cols-1 grid-rows-[1fr_auto] gap-2 min-h-0 mobile-landscape-grid-fix">
            <div className="grid grid-cols-2 gap-2">
                <RouletteWheel potAmount={pot} isSpinning={isSpinning} winningNumber={winningNumber} />
                <RouletteTable
                    isPanelVersion={false}
                    showBettingControls={true}
                    selectedBet={selectedBet}
                    onBetSelectionChange={setSelectedBet}
                    disabled={!canBet}
                    playerBalance={currentPlayer?.balance || 0}
                    onBet={isOnlineGame ? handleOnlineBet : handleLocalBet}
                />
            </div>
             <GameLog events={currentLog} isExpanded={isLogExpanded} onToggleExpand={() => setIsLogExpanded(p => !p)} className="min-h-0"/>
          </div>
        </main>

        {/* --- Desktop / Large Tablet Layout (>=768px) --- */}
        <main className="hidden md:grid grid-rows-[auto_1fr_auto] absolute inset-0 gap-4">
          {/* Players */}
          <div className="bg-slate-800 rounded-lg p-2 flex flex-row items-center gap-4 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-300 border-r-2 border-slate-700 pr-4 shrink-0">Players</h2>
              <div className="flex flex-row gap-4 overflow-x-auto">
                {players.map((player, index) => (
                  <PlayerCard key={player.id} player={player} isCurrent={index === currentPlayerIndex && !winner} />
                ))}
              </div>
          </div>
          
          {/* Middle content */}
          <div className="grid grid-cols-5 gap-4 min-h-0">
            {/* Roulette Wheel */}
            <div className="col-span-2 p-4 bg-slate-800/50 rounded-lg">
                <RouletteWheel potAmount={pot} isSpinning={isSpinning} winningNumber={winningNumber} />
            </div>
            
            {/* Combined Betting Panel */}
            <RouletteTable
              className="col-span-3"
              isPanelVersion={true}
              showBettingControls={true}
              selectedBet={selectedBet}
              onBetSelectionChange={setSelectedBet}
              disabled={!canBet}
              playerBalance={currentPlayer?.balance || 0}
              onBet={isOnlineGame ? handleOnlineBet : handleLocalBet}
            />
          </div>

          {/* Game Log */}
           <GameLog events={currentLog} isExpanded={isLogExpanded} onToggleExpand={() => setIsLogExpanded(p => !p)} className="col-span-full min-h-0"/>
        </main>
      </div>
    </div>
  );
};

export default App;