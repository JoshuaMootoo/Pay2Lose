import React from 'react';
import { BetType, Player, AIPersonality, BetConfig } from './types';
import { SingleNumberIcon, DozenIcon, RedBlackIcon } from './components/icons/BetIcons';

export const STARTING_BALANCE = 1000;
export const POT_STARTING_AMOUNT = 0;

export const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: 'You', balance: STARTING_BALANCE, isAI: false },
  { id: 2, name: 'Risky Rick', balance: STARTING_BALANCE, isAI: true, personality: AIPersonality.RiskLover },
  { id: 3, name: 'Clumsy Chloe', balance: STARTING_BALANCE, isAI: true, personality: AIPersonality.AccidentProne },
  { id: 4, name: 'Balanced Ben', balance: STARTING_BALANCE, isAI: true, personality: AIPersonality.Balanced },
];

export const BET_CONFIG: Record<BetType, BetConfig> = {
  [BetType.SingleNumber]: {
    winChance: 1 / 37,
    name: 'Single Number',
    description: 'High chance to lose (~97.3%)',
    icon: <SingleNumberIcon />,
    maxBet: 100,
  },
  [BetType.Dozen]: {
    winChance: 12 / 37,
    name: 'Dozen',
    description: 'Medium chance to lose (~67.6%)',
    icon: <DozenIcon />,
    maxBet: 250,
  },
  [BetType.RedBlack]: {
    winChance: 18 / 37,
    name: 'Red/Black',
    description: 'Low chance to lose (~51.4%)',
    icon: <RedBlackIcon />,
    maxBet: 500,
  },
};

export const ROULETTE_NUMBERS = {
  red: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
  black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
  green: [0],
};
