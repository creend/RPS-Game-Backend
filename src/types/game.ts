import { Pick } from './pick';

export type Game = {
  id: string;
  clients: {
    pick: Pick;
    id: string;
    score: number;
  }[];
};
