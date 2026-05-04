# podcasts

A small HTTP service that exposes radio shows as podcast RSS feeds. Each
station has its own adapter; the included one scrapes
[IDA Radio](https://www.idaidaida.net/). Audio is downloaded with `yt-dlp`
on first request and cached on disk, so subsequent listens are instant.

## Stack

TypeScript, Koa, yt-dlp, ffmpeg. No database — episode metadata is cached
in memory (30 min TTL); audio files live on disk under `data/audio/`.

## Routes

- `GET /` — lists configured feeds
- `GET /feeds/{showId}.xml` — RSS feed for a show
- `GET /audio/{showId}/{episodeId}.mp3` — cached MP3 (downloaded on first hit)

## Configuration

Environment variables, all optional:

| Var               | Default                      | Notes                                        |
| ----------------- | ---------------------------- | -------------------------------------------- |
| `PORT`            | `3000`                       | HTTP port                                    |
| `STORAGE_DIR`     | `./data/audio`               | Where downloaded MP3s are cached             |
| `PUBLIC_BASE_URL` | `http://localhost:${PORT}`   | Used in feed enclosure URLs — set in prod    |

## Local development

Requires Node 22+, Yarn 4, `yt-dlp`, and `ffmpeg` on `PATH`.

```sh
yarn install
yarn dev          # tsx watch
# or
yarn build && yarn start
```

Then visit <http://localhost:3000/>.

## Adding a show

For an existing adapter, append an entry to [src/shows.ts](src/shows.ts):

```ts
{ id: 'my-show', adapter: idaRadioAdapter, sourceId: 'my-show' }
```

The `id` is what appears in feed URLs; `sourceId` is the slug on the source
site (e.g. `lets-play-house` for `idaidaida.net/shows/lets-play-house`).

## Adding a station

Implement the `Adapter` interface in [src/adapters/types.ts](src/adapters/types.ts)
and register your adapter instance in `src/shows.ts`. Each adapter returns
`Show` metadata and a list of `Episode`s, where each episode points to an
audio URL that `yt-dlp` can download (SoundCloud, Mixcloud, Bandcamp,
direct MP3, etc.).

See [src/adapters/ida-radio.ts](src/adapters/ida-radio.ts) for a full example.

## Docker image

The [GitHub Action](.github/workflows/docker.yml) publishes
`ghcr.io/priithaamer/podcasts` on every push to `main` and on `v*` tags.

Tags published:

- `latest` — tip of `main`
- `main`, `sha-<short>` — every push
- `v1.2.3` — semver tags

The image bundles `yt-dlp` (latest static binary) and `ffmpeg`.

If you want the package public, after the first run go to the repo's
**Packages → podcasts → Package settings** and switch visibility.

## Deploying on Synology

1. **Reverse proxy.** In **Control Panel → Login Portal → Advanced → Reverse
   Proxy**, point `https://podcasts.example.com` → `http://localhost:3000`
   (or whatever host port you choose).

2. **Project folder.** Via SSH or File Station:

   ```sh
   mkdir -p /volume1/docker/podcasts/data
   ```

   Copy [docker-compose.yml](docker-compose.yml) into
   `/volume1/docker/podcasts/` and edit `PUBLIC_BASE_URL` to match your
   reverse-proxy hostname.

3. **(Private package only.)** Authenticate to GHCR on the NAS:

   ```sh
   echo <GHCR_PAT_WITH_read:packages> | sudo docker login ghcr.io -u priithaamer --password-stdin
   ```

4. **Deploy.** In **Container Manager → Project → Create**:
   - Project name: `podcasts`
   - Path: `/volume1/docker/podcasts`
   - Source: "Use existing docker-compose.yml"
   - Click **Build**

   Or from SSH:

   ```sh
   cd /volume1/docker/podcasts
   sudo docker compose pull && sudo docker compose up -d
   ```

5. **Updates.** When the Action publishes a new `:latest`, redeploy:

   ```sh
   sudo docker compose pull && sudo docker compose up -d
   ```

   In Container Manager: **Project → podcasts → Action → Build**.

Downloaded audio lives at `/volume1/docker/podcasts/data/audio/` — browseable
in File Station and persistent across container rebuilds.

## What survives a restart

- **Audio files** — yes, on the `/data` volume.
- **Episode metadata cache** — no, it's in memory. The first feed request
  after restart re-scrapes the source page (~1s) and re-populates it.
- **Episode IDs** — stable (slugs from the source), so cached MP3s match up
  with new feed entries automatically.
