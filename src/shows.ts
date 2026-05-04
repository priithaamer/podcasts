import { idaRadioAdapter } from './adapters/ida-radio.js';
import type { Adapter } from './adapters/types.js';

export interface ShowConfig {
  id: string;
  adapter: Adapter;
  sourceId: string;
}

export const shows: ShowConfig[] = [
  {
    id: 'lets-play-house',
    adapter: idaRadioAdapter,
    sourceId: 'lets-play-house',
  },
  {
    id: 'vibratsioon',
    adapter: idaRadioAdapter,
    sourceId: 'vibratsioon',
  },
];

export const findShow = (id: string): ShowConfig | undefined =>
  shows.find((show) => show.id === id);
