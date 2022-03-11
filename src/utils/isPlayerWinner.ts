import { Pick } from '../types/pick';

export const isPlayerWinner = (
  playerPick: Pick,
  enemyPick: Pick
): boolean | 'draw' => {
  if (playerPick === 'paper' && enemyPick === 'rock') {
    return true;
  } else if (playerPick === 'paper' && enemyPick === 'scissors') {
    return false;
  } else if (playerPick === 'rock' && enemyPick === 'paper') {
    return false;
  } else if (playerPick === 'rock' && enemyPick === 'scissors') {
    return true;
  } else if (playerPick === 'scissors' && enemyPick === 'paper') {
    return true;
  } else if (playerPick === 'scissors' && enemyPick === 'rock') {
    return false;
  } else {
    return 'draw';
  }
};
