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
  // Fix: To resolve the 'Cannot find namespace JSX' error, explicitly use React.ReactElement, which is available from the React import.
  icon: React.ReactElement;
}

export interface GameEvent {
  id: number;
  text: string;
}