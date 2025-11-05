import React from 'react';

export enum BetType {
  SingleNumber = 'SINGLE_NUMBER',
  Dozen = 'DOZEN',
  RedBlack = 'RED_BLACK',
}

export enum AIPersonality {
  RiskLover = 'Risk Lover',
  AccidentProne = 'Accident Prone',
  Balanced = 'Balanced',
}

export interface Player {
  id: number;
  name: string;
  balance: number;
  isAI: boolean;
  personality?: AIPersonality;
}

export interface BetConfig {
  winChance: number;
  name: string;
  description: string;
  maxBet: number;
  icon: React.ReactElement;
}

export interface GameEvent {
  id: number;
  text: string;
}

// Represents an action taken by a guest player that needs to be processed by the host.
export interface GameAction {
  actionId: string; // A unique ID to prevent reprocessing
  playerId: number;
  type: 'JOIN' | 'BET';
  payload: any;
}

// Represents the complete state of an online game, stored and synchronized.
export interface OnlineGameState {
  hostId: number;
  status: 'lobby' | 'playing' | 'finished';
  players: Player[];
  pot: number;
  currentPlayerIndex: number;
  gameLog: GameEvent[];
  winningNumber: number | null;
  guestActions: GameAction[];
  version: number; // A counter to help clients detect updates
}
