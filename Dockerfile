FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV YARN_ENABLE_GLOBAL_CACHE=false
COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack enable && yarn install --immutable
COPY tsconfig.json ./
COPY src ./src
RUN yarn build && yarn workspaces focus --production --all 2>/dev/null || yarn install --immutable

FROM node:22-bookworm-slim AS runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 ca-certificates curl \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod +x /usr/local/bin/yt-dlp \
  && apt-get purge -y curl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV STORAGE_DIR=/data/audio
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
VOLUME ["/data"]
EXPOSE 3000
CMD ["node", "dist/index.js"]
