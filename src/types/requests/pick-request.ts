import { EventTypes } from '../event-types';
import { Pick } from '../pick';

export type PickRequest = {
  method: EventTypes;
  clientId: string;
  gameId: string;
  pick: Pick;
};
