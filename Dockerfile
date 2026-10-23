# syntax=docker/dockerfile:1

FROM node:24-bookworm AS builder

WORKDIR /work
# Copy dependency manifests first to improve Docker layer caching.
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:24-bookworm AS production-dependencies

WORKDIR /work
# Install only dependencies required at runtime. (Optional dependency needed for sharp)
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force
ARG GIT_SHA=unknown
RUN printf '%s\n' "${GIT_SHA}" | cut -c1-7 > git_revision.txt

FROM node:24-bookworm-slim AS runtime

EXPOSE 3000
ENV NODE_ENV=production \
    PORT=3000

WORKDIR /usr/src/app
COPY --from=builder --chown=node:node /work/dist ./dist
COPY --from=builder --chown=node:node /work/index.js ./
COPY --from=builder --chown=node:node /work/openapi.yml ./
COPY --from=production-dependencies --chown=node:node /work/git_revision.txt ./
COPY --from=production-dependencies --chown=node:node /work/node_modules ./node_modules
COPY --from=production-dependencies --chown=node:node /work/package.json ./

USER node

CMD ["node", "./index.js"]
