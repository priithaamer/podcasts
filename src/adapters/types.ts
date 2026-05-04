export interface Episode {
  id: string;
  title: string;
  date: Date;
  description?: string;
  imageUrl?: string;
  audioUrls: string[];
}

export interface Show {
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
  author?: string;
}

export interface Adapter {
  readonly id: string;
  fetchShow(sourceId: string): Promise<Show>;
  fetchEpisodes(sourceId: string): Promise<Episode[]>;
}
