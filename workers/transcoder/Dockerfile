# Dockerfile untuk Playly Transcoder Worker
# Build: docker build -t playly-transcoder .
# Run:   docker run --env-file .env playly-transcoder

FROM node:20-slim

# Install ffmpeg, ffprobe, dan curl untuk docker-compose healthcheck.
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY index.mjs ./

EXPOSE 3000

CMD ["node", "index.mjs"]
