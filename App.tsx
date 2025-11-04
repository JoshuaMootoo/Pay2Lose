import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, BetType, GameEvent, AIPersonality } from './types';
import { INITIAL_PLAYERS, STARTING_BALANCE, POT_STARTING_AMOUNT, BET_CONFIG, ROULETTE_NUMBERS } from './constants';
import PlayerCard from './components/PlayerCard';
import BettingControls from './components/BettingControls';
import GameLog from './components/GameLog';
import GameOverModal from './components/GameOverModal';
import RouletteWheel from './components/RouletteWheel';

const isRed = (num: number) => ROULETTE_NUMBERS.red.includes(num);

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [pot, setPot] = useState<number>(POT_STARTING_AMOUNT);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [gameLog, setGameLog] = useState<GameEvent[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const eventIdCounter = useRef(0);

  const addLog = (text: string) => {
    setGameLog(prevLog => [...prevLog, { id: eventIdCounter.current++, text }]);
  };

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

  const processTurn = useCallback((player: Player, betType: BetType, amount: number) => {
    setIsSpinning(true);
    setWinningNumber(null);
    addLog(`${player.name} bets $${amount} on ${BET_CONFIG[betType].name}.`);

    setTimeout(() => {
      const resultNumber = Math.floor(Math.random() * 37);
      setWinningNumber(resultNumber);

      let isWin = false;
      switch (betType) {
        case BetType.SingleNumber:
          // Assume bet on #1 to match 1/37 odds
          isWin = resultNumber === 1;
          break;
        case BetType.Dozen:
          // Assume bet on first dozen (1-12) to match 12/37 odds
          isWin = resultNumber >= 1 && resultNumber <= 12;
          break;
        case BetType.RedBlack:
          // Assume bet on Red to match 18/37 odds
          isWin = isRed(resultNumber);
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
  }, [players, pot, advanceTurn]);

  const determineAIBet = useCallback((player: Player): { betType: BetType; amount: number } => {
    let betType: BetType;
    const rand = Math.random();

    if (player.balance <= BET_CONFIG[BetType.SingleNumber].maxBet) {
        return { betType: BetType.SingleNumber, amount: Math.min(player.balance, Math.floor(Math.random() * 10) + 1) };
    }

    switch (player.personality) {
      case AIPersonality.RiskLover:
        betType = rand < 0.9 ? BetType.SingleNumber : BetType.Dozen;
        break;
      case AIPersonality.AccidentProne:
        betType = rand < 0.8 ? BetType.RedBlack : BetType.Dozen;
        break;
      case AIPersonality.Balanced:
      default:
        if (rand < 0.2) betType = BetType.SingleNumber;
        else if (rand < 0.7) betType = BetType.Dozen;
        else betType = BetType.RedBlack;
        break;
    }

    const minBetPercent = player.personality === AIPersonality.AccidentProne ? 0.05 : 0.15;
    const maxBetPercent = player.personality === AIPersonality.RiskLover ? 0.3 : 0.2;
    const betPercent = Math.random() * (maxBetPercent - minBetPercent) + minBetPercent;
    const amount = Math.max(1, Math.floor(player.balance * betPercent));

    const maxBetForType = BET_CONFIG[betType].maxBet;
    return { betType, amount: Math.min(amount, player.balance, maxBetForType) };
  }, []);

  useEffect(() => {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer?.isAI && !isSpinning && !winner) {
      const { betType, amount } = determineAIBet(currentPlayer);
      setTimeout(() => {
        processTurn(currentPlayer, betType, amount);
      }, 1000);
    }
  }, [currentPlayerIndex, players, isSpinning, winner, processTurn, determineAIBet]);
  
  const handleRestart = () => {
    setPlayers(INITIAL_PLAYERS.map(p => ({...p, balance: STARTING_BALANCE})));
    setPot(POT_STARTING_AMOUNT);
    setCurrentPlayerIndex(0);
    setGameLog([]);
    setWinner(null);
    setIsSpinning(false);
    setWinningNumber(null);
    eventIdCounter.current = 0;
    addLog("New game started. Objective: Lose all your money!");
  };

  useEffect(() => {
    addLog("Welcome to Reverse Roulette! The first to $0 wins.");
  }, []);

  const currentPlayer = players[currentPlayerIndex];
  const isPlayerTurn = !currentPlayer?.isAI && !isSpinning && !winner;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      {winner && <GameOverModal winner={winner} onRestart={handleRestart} />}
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            Reverse Roulette
          </h1>
          <p className="text-slate-400 mt-2 text-lg">The goal is to go broke. Don't win!</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-300 border-b-2 border-slate-700 pb-2">Players</h2>
            {players.map((player, index) => (
              <PlayerCard key={player.id} player={player} isCurrent={index === currentPlayerIndex && !winner} />
            ))}
          </aside>

          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <RouletteWheel
                potAmount={pot}
                isSpinning={isSpinning}
                winningNumber={winningNumber}
              />
              <GameLog events={gameLog} />
            </div>
            
            <BettingControls
              playerBalance={players[0].balance}
              onBet={(betType, amount) => processTurn(players[0], betType, amount)}
              disabled={!isPlayerTurn}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
