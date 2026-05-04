import type { Episode, Show } from './adapters/types.js';
import type { ShowConfig } from './shows.js';

interface CacheEntry {
  show: Show;
  episodes: Episode[];
  fetchedAt: number;
}

const TTL_MS = 30 * 60 * 1000;

export class ShowCache {
  private readonly entries = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<CacheEntry>>();

  async get(config: ShowConfig): Promise<CacheEntry> {
    const cached = this.entries.get(config.id);
    if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
      return cached;
    }
    const existing = this.inFlight.get(config.id);
    if (existing) {
      return existing;
    }
    const promise = this.refresh(config).finally(() => {
      this.inFlight.delete(config.id);
    });
    this.inFlight.set(config.id, promise);
    return promise;
  }

  private async refresh(config: ShowConfig): Promise<CacheEntry> {
    const [show, episodes] = await Promise.all([
      config.adapter.fetchShow(config.sourceId),
      config.adapter.fetchEpisodes(config.sourceId),
    ]);
    const entry: CacheEntry = { show, episodes, fetchedAt: Date.now() };
    this.entries.set(config.id, entry);
    return entry;
  }
}
