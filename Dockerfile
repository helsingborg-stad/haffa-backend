# syntax=docker/dockerfile:1

FROM node:24-bookworm AS builder

WORKDIR /work
# Copy dependency manifests first to improve Docker layer caching.
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:24-bookworm AS git-rev

WORKDIR /work
COPY .git .git
RUN git rev-parse --short HEAD >  git_revision.txt

FROM node:24-bookworm AS production-dependencies

WORKDIR /work
# Install only dependencies required at runtime. (Optional dependency needed for sharp)
COPY package.json package-lock.json .npmrc scheduled-jobs-runner.sh ./
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force

FROM node:24-bookworm-slim AS runtime

EXPOSE 3000
ENV NODE_ENV=production \
    PORT=3000

WORKDIR /usr/src/app
COPY --from=builder --chown=node:node /work/dist ./dist
COPY --from=builder --chown=node:node /work/index.js ./
COPY --from=builder --chown=node:node /work/openapi.yml ./
COPY --from=git-rev /work/git_revision.txt ./
COPY --from=production-dependencies --chown=node:node /work/node_modules ./node_modules
COPY --from=production-dependencies --chown=node:node /work/package.json ./
COPY --from=production-dependencies --chown=node:node /work/scheduled-jobs-runner.sh ./

RUN apt-get update \
    && apt-get install -y --no-install-recommends cron \
    && rm -rf /var/lib/apt/lists/*

RUN crontab -l 2>/dev/null | { cat; echo "0 6 * * * su -s /bin/sh node -c '/bin/sh /usr/src/app/scheduled-jobs-runner.sh' >> /tmp/runner.log 2>&1"; } | crontab -

USER node

CMD ["node", "./index.js"]
