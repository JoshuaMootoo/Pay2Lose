
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, BetType, GameEvent, AIPersonality } from './types';
import { INITIAL_PLAYERS, STARTING_BALANCE, POT_STARTING_AMOUNT, BET_CONFIG, ROULETTE_NUMBERS } from './constants';
import PlayerCard from './components/PlayerCard';
import BettingControls from './components/BettingControls';
import GameLog from './components/GameLog';
import GameOverModal from './components/GameOverModal';
import RouletteWheel from './components/RouletteWheel';
import RouletteTable from './components/RouletteTable';
import TitleScreen from './components/TitleScreen';
import PauseModal from './components/PauseModal';
import { PauseIcon } from './components/icons/UIcons';

const isRed = (num: number) => ROULETTE_NUMBERS.red.includes(num);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused'>('title');
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [pot, setPot] = useState<number>(POT_STARTING_AMOUNT);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [gameLog, setGameLog] = useState<GameEvent[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<{ type: BetType; value: any }>({ type: BetType.SingleNumber, value: 0 });
  const eventIdCounter = useRef(0);

  const addLog = useCallback((text: string) => {
    setGameLog(prevLog => [...prevLog, { id: eventIdCounter.current++, text }]);
  }, []);

  const resetGame = useCallback(() => {
    setPlayers(INITIAL_PLAYERS.map(p => ({...p, balance: STARTING_BALANCE})));
    setPot(POT_STARTING_AMOUNT);
    setCurrentPlayerIndex(0);
    setGameLog([]);
    setWinner(null);
    setIsSpinning(false);
    setWinningNumber(null);
    eventIdCounter.current = 0;
    setSelectedBet({ type: BetType.SingleNumber, value: 0 });
  }, []);

  const advanceTurn = useCallback(() => {
    if (winner) return;
    setCurrentPlayerIndex(prevIndex => {
      let nextIndex = (prevIndex + 1) % players.length;
      while (players[nextIndex].balance <= 0) {
        nextIndex = (nextIndex + 1) % players.length;
        if (nextIndex === prevIndex) break; // All other players are out
      }
      return nextIndex;
    });
  }, [players, winner]);

  const processTurn = useCallback((player: Player, bet: { type: BetType; value: any }, amount: number) => {
    setIsSpinning(true);
    setWinningNumber(null);

    let betDescription = '';
    switch (bet.type) {
      case BetType.SingleNumber:
        betDescription = `Single Number (${bet.value})`;
        break;
      case BetType.Dozen:
        betDescription = `${bet.value} Dozen`;
        break;
      case BetType.RedBlack:
        betDescription = `${(bet.value as string).toUpperCase()}`;
        break;
    }
    addLog(`${player.name} bets $${amount} on ${betDescription}.`);

    setTimeout(() => {
      const resultNumber = Math.floor(Math.random() * 37);
      setWinningNumber(resultNumber);

      let isWin = false;
      switch (bet.type) {
        case BetType.SingleNumber:
          isWin = resultNumber === bet.value;
          break;
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
      addLog(`The ball lands on ${resultNumber} ${color}!`);

      let newBalance: number;
      let newPot = pot;

      if (isWin) {
        addLog(`💥 Oh no! ${player.name} wins the spin! They take the pot of $${pot} and get their $${amount} bet back.`);
        newBalance = player.balance + pot;
        newPot = 0;
      } else {
        addLog(`✅ Success! ${player.name} loses the spin. Their $${amount} bet is added to the pot.`);
        newBalance = player.balance - amount;
        newPot += amount;
      }

      const updatedPlayers = players.map(p =>
        p.id === player.id ? { ...p, balance: newBalance } : p
      );

      setPlayers(updatedPlayers);
      setPot(newPot);

      if (newBalance <= 0) {
        const gameWinner = { ...player, balance: 0 };
        setWinner(gameWinner);
        setPlayers(players.map(p => p.id === player.id ? gameWinner : p));
        addLog(`🎉 ${player.name} has hit zero! They are the WINNER!`);
      } else {
        advanceTurn();
      }
      setIsSpinning(false);
    }, 2500); // Increased duration for wheel animation
  }, [players, pot, advanceTurn, addLog]);

  const determineAIBet = useCallback((player: Player): { bet: { type: BetType; value: any }; amount: number } => {
    let betType: BetType;
    let betValue: any;
    const rand = Math.random();

    // AI personality determines the type of bet they prefer
    switch (player.personality) {
      case AIPersonality.RiskLover:
        // 90% chance for high-risk single number, 10% for medium-risk dozen
        betType = rand < 0.9 ? BetType.SingleNumber : BetType.Dozen;
        break;
      case AIPersonality.AccidentProne:
        // 80% chance for "safer" red/black (higher chance to win pot), 20% for dozen
        betType = rand < 0.8 ? BetType.RedBlack : BetType.Dozen;
        break;
      case AIPersonality.Balanced:
      default:
        // Balanced distribution of risk
        if (rand < 0.2) betType = BetType.SingleNumber;
        else if (rand < 0.7) betType = BetType.Dozen;
        else betType = BetType.RedBlack;
        break;
    }
    
    // Determine the specific value for the chosen bet type
    switch (betType) {
      case BetType.SingleNumber:
        betValue = Math.floor(Math.random() * 37);
        break;
      case BetType.Dozen:
        const dozens = ['1st', '2nd', '3rd'];
        betValue = dozens[Math.floor(Math.random() * 3)];
        break;
      case BetType.RedBlack:
        betValue = Math.random() < 0.5 ? 'red' : 'black';
        break;
    }

    // AI now bets the maximum possible amount for the chosen bet type, capped by their balance.
    // This aligns the AI's betting strategy with the player's.
    const maxBetForType = BET_CONFIG[betType].maxBet;
    const amount = Math.min(player.balance, maxBetForType);

    return { bet: { type: betType, value: betValue }, amount };
  }, []);

  useEffect(() => {
    const currentPlayer = players[currentPlayerIndex];
    if (gameState === 'playing' && currentPlayer?.isAI && !isSpinning && !winner) {
      const { bet, amount } = determineAIBet(currentPlayer);
      setTimeout(() => {
        processTurn(currentPlayer, bet, amount);
      }, 1000);
    }
  }, [currentPlayerIndex, players, isSpinning, winner, processTurn, determineAIBet, gameState]);
  
  const handleStartGame = () => {
    setGameState('playing');
    addLog("Welcome to Reverse Roulette! The first to $0 wins.");
  };

  const handleRestart = () => {
    resetGame();
    addLog("New game started. Objective: Lose all your money!");
  };

  const handleQuitToMenu = () => {
    resetGame();
    setGameState('title');
  };

  const handlePause = () => setGameState('paused');
  const handleResume = () => setGameState('playing');

  const currentPlayer = players[currentPlayerIndex];
  const isPlayerTurn = gameState === 'playing' && !currentPlayer?.isAI && !isSpinning && !winner;
  
  if (gameState === 'title') {
    return <TitleScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="h-screen max-h-screen bg-slate-900 text-slate-100 font-sans p-2 flex flex-col overflow-hidden">
      {winner && <GameOverModal winner={winner} onRestart={handleRestart} onBackToMenu={handleQuitToMenu} />}
      {gameState === 'paused' && <PauseModal onResume={handleResume} onQuit={handleQuitToMenu} />}

      <header className="relative text-center mb-1 lg:mb-2 shrink-0">
        <button 
          onClick={handlePause}
          className="absolute top-0 right-0 text-slate-400 hover:text-white transition-colors z-30"
          aria-label="Pause game"
        >
          <PauseIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
          Reverse Roulette
        </h1>
        <p className="text-slate-400 mt-0 lg:mt-1 text-xs lg:text-sm">The goal is to go broke. Don't win!</p>
      </header>

      <main className="flex-grow flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-2 min-h-0">
        <aside className="md:col-span-2 lg:col-span-1 space-y-2 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-300 border-b-2 border-slate-700 pb-1 shrink-0">Players</h2>
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto py-1">
            {players.map((player, index) => (
              <PlayerCard key={player.id} player={player} isCurrent={index === currentPlayerIndex && !winner} />
            ))}
          </div>
        </aside>

        <div className="flex flex-row items-center justify-start gap-2">
          <RouletteWheel
            potAmount={pot}
            isSpinning={isSpinning}
            winningNumber={winningNumber}
          />
          <RouletteTable
            selectedBet={selectedBet}
            onBetSelectionChange={setSelectedBet}
            disabled={!isPlayerTurn}
          />
        </div>
        
        <div className="flex flex-col space-y-2 min-h-0 flex-grow">
          <GameLog events={gameLog} />
          <BettingControls
            playerBalance={players[0].balance}
            onBet={(amount) => processTurn(players[0], selectedBet, amount)}
            disabled={!isPlayerTurn}
            selectedBet={selectedBet}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
