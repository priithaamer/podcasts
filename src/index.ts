import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import Router from '@koa/router';
import Koa from 'koa';
import { AudioCache } from './audio-cache.js';
import { renderFeed } from './feed.js';
import { ShowCache } from './show-cache.js';
import { findShow, shows } from './shows.js';

const PORT = Number(process.env.PORT ?? 3000);
const STORAGE_DIR = process.env.STORAGE_DIR ?? path.resolve('data/audio');
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? `http://localhost:${PORT}`;

const audioCache = new AudioCache({ storageDir: STORAGE_DIR });
const showCache = new ShowCache();

const app = new Koa();
const router = new Router();

router.get('/', (ctx) => {
  ctx.type = 'text/plain';
  ctx.body = ['Podcasts', '', 'Available feeds:']
    .concat(shows.map((show) => `  ${PUBLIC_BASE_URL}/feeds/${show.id}.xml`))
    .join('\n');
});

router.get('/feeds/:showId.xml', async (ctx) => {
  const config = findShow(ctx.params.showId);
  if (!config) {
    ctx.status = 404;
    ctx.body = 'Unknown show';
    return;
  }
  const { show, episodes } = await showCache.get(config);
  const merged = { ...show, imageUrl: config.imageUrl ?? show.imageUrl };
  ctx.type = 'application/rss+xml; charset=utf-8';
  ctx.body = renderFeed({ showId: config.id, show: merged, episodes, baseUrl: PUBLIC_BASE_URL });
});

router.get('/audio/:showId/:episodeId.mp3', async (ctx) => {
  const { showId, episodeId } = ctx.params;
  const config = findShow(showId);
  if (!config) {
    ctx.status = 404;
    ctx.body = 'Unknown show';
    return;
  }
  const { episodes } = await showCache.get(config);
  const episode = episodes.find((ep) => ep.id === episodeId);
  if (!episode) {
    ctx.status = 404;
    ctx.body = 'Unknown episode';
    return;
  }
  const filePath = await audioCache.ensureDownloaded(showId, episodeId, episode.audioUrls);
  const stats = await stat(filePath);
  ctx.type = 'audio/mpeg';
  ctx.length = stats.size;
  ctx.set('Accept-Ranges', 'bytes');
  ctx.body = createReadStream(filePath);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(`[${ctx.method} ${ctx.url}]`, err);
    ctx.status = 500;
    ctx.body = 'Internal error';
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Podcasts server listening on ${PUBLIC_BASE_URL}`);
  for (const show of shows) {
    console.log(`  feed: ${PUBLIC_BASE_URL}/feeds/${show.id}.xml`);
  }
});
