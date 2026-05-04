import type { Adapter, Episode, Show } from './types.js';

const BASE_URL = 'https://www.idaidaida.net';
const USER_AGENT = 'Mozilla/5.0 (Podcasts/0.1)';

interface IdaImageFormat {
  url: string;
}

interface IdaEpisode {
  id: number;
  start: string;
  title: string;
  slug: string;
  subtitle: string | null;
  soundcloud: string | null;
  mixcloud: string | null;
  featuredImage?: {
    url?: string;
    formats?: { small?: IdaImageFormat; thumbnail?: IdaImageFormat };
  };
  show: { id: number; title: string; slug: string };
}

const fetchHtml = async (url: string): Promise<string> => {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Fetch ${url} failed: ${res.status} ${res.statusText}`);
  }
  return res.text();
};

const extractNextPayload = (html: string): string => {
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let combined = '';
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    combined += JSON.parse(`"${match[1]}"`);
  }
  return combined;
};

const findItemsArray = (payload: string): unknown[] => {
  const re = /"total":\d+,"items":\[/g;
  let match: RegExpExecArray | null;
  let best: unknown[] = [];
  while ((match = re.exec(payload)) !== null) {
    const start = match.index + match[0].length - 1;
    const end = findArrayEnd(payload, start);
    if (end < 0) {
      continue;
    }
    try {
      const parsed = JSON.parse(payload.slice(start, end + 1));
      if (Array.isArray(parsed) && parsed.length > best.length) {
        best = parsed;
      }
    } catch {
      // skip non-parsing matches
    }
  }
  return best;
};

const findArrayEnd = (text: string, openIndex: number): number => {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }
    if (ch === '[' || ch === '{') {
      depth++;
    } else if (ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
};

const pickImage = (ep: IdaEpisode): string | undefined => {
  const img = ep.featuredImage;
  return img?.formats?.small?.url ?? img?.url ?? img?.formats?.thumbnail?.url;
};

const toEpisode = (ep: IdaEpisode): Episode | null => {
  if (!ep.soundcloud) {
    return null;
  }
  return {
    id: ep.slug,
    title: ep.subtitle ? `${ep.title} — ${ep.subtitle}` : ep.title,
    date: new Date(ep.start),
    description: ep.subtitle ?? undefined,
    imageUrl: pickImage(ep),
    audio: { url: `https://soundcloud.com/${ep.soundcloud}` },
  };
};

export const idaRadioAdapter: Adapter = {
  id: 'ida-radio',

  async fetchShow(sourceId: string): Promise<Show> {
    const url = `${BASE_URL}/shows/${sourceId}`;
    const html = await fetchHtml(url);
    const payload = extractNextPayload(html);
    const items = findItemsArray(payload) as IdaEpisode[];
    const first = items.at(0);
    const title = first?.show?.title ?? sourceId;
    return {
      title,
      description: `${title} on IDA Radio (idaidaida.net).`,
      link: url,
      author: 'IDA Radio',
    };
  },

  async fetchEpisodes(sourceId: string): Promise<Episode[]> {
    const url = `${BASE_URL}/shows/${sourceId}`;
    const html = await fetchHtml(url);
    const payload = extractNextPayload(html);
    const items = findItemsArray(payload) as IdaEpisode[];
    return items
      .map(toEpisode)
      .filter((ep): ep is Episode => ep !== null)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  },
};
