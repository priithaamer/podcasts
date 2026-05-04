import { idaRadioAdapter } from './adapters/ida-radio.js';
import type { Adapter } from './adapters/types.js';

export interface ShowConfig {
  id: string;
  adapter: Adapter;
  sourceId: string;
  imageUrl?: string;
}

export const shows: ShowConfig[] = [
  {
    id: 'lets-play-house',
    adapter: idaRadioAdapter,
    sourceId: 'lets-play-house',
    imageUrl:
      'https://www.idaidaida.net/_next/image?url=https%3A%2F%2Fida-radio.fra1.digitaloceanspaces.com%2Fuploads%2F481de6ece9423b5f3c4616fb9a0d1a4b.jpg&w=3840&q=75',
  },
  {
    id: 'vibratsioon',
    adapter: idaRadioAdapter,
    sourceId: 'vibratsioon',
    imageUrl:
      'https://www.idaidaida.net/_next/image?url=https%3A%2F%2Fida-radio.fra1.digitaloceanspaces.com%2Fuploads%2F16934d3f6d3120e24388d722fb1b11ff.jpg&w=3840&q=75',
  },
];

export const findShow = (id: string): ShowConfig | undefined =>
  shows.find((show) => show.id === id);
