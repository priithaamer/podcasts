import type { Episode, Show } from './adapters/types.js';

interface FeedInput {
  showId: string;
  show: Show;
  episodes: Episode[];
  baseUrl: string;
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const cdata = (value: string): string => `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

const renderItem = (episode: Episode, showId: string, baseUrl: string): string => {
  const audioUrl = `${baseUrl}/audio/${encodeURIComponent(showId)}/${encodeURIComponent(episode.id)}.mp3`;
  const guid = `${showId}/${episode.id}`;
  const image = episode.imageUrl
    ? `    <itunes:image href="${escapeXml(episode.imageUrl)}" />\n`
    : '';
  return `  <item>
    <title>${escapeXml(episode.title)}</title>
    <description>${cdata(episode.description ?? episode.title)}</description>
    <pubDate>${episode.date.toUTCString()}</pubDate>
    <guid isPermaLink="false">${escapeXml(guid)}</guid>
    <enclosure url="${escapeXml(audioUrl)}" type="audio/mpeg" />
${image}    <itunes:duration>0</itunes:duration>
  </item>`;
};

export const renderFeed = ({ showId, show, episodes, baseUrl }: FeedInput): string => {
  const feedUrl = `${baseUrl}/feeds/${encodeURIComponent(showId)}.xml`;
  const image = show.imageUrl
    ? `    <itunes:image href="${escapeXml(show.imageUrl)}" />\n    <image><url>${escapeXml(show.imageUrl)}</url><title>${escapeXml(show.title)}</title><link>${escapeXml(show.link)}</link></image>\n`
    : '';
  const items = episodes.map((ep) => renderItem(ep, showId, baseUrl)).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(show.title)}</title>
  <link>${escapeXml(show.link)}</link>
  <description>${cdata(show.description)}</description>
  <language>en</language>
  <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
  <itunes:author>${escapeXml(show.author ?? show.title)}</itunes:author>
  <itunes:explicit>false</itunes:explicit>
${image}${items}
</channel>
</rss>
`;
};
