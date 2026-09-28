FROM node:24 as compiler
ARG GITHUB_ACCESS_TOKEN
WORKDIR /work
COPY . ./
RUN npm ci && npm run build

FROM node:24 as git-rev
WORKDIR /work
COPY .git .git
RUN git rev-parse --short HEAD >  git_revision.txt

FROM node:24-alpine	as optimizer
ARG GITHUB_ACCESS_TOKEN
WORKDIR /work
COPY . ./
RUN npm ci --omit=dev --ignore-scripts

FROM mcr.microsoft.com/devcontainers/javascript-node:5-24-bookworm
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /usr/src/app
COPY --from=optimizer /work/node_modules ./node_modules
COPY --from=optimizer /work/package.json ./
COPY --from=compiler /work/dist ./dist
COPY --from=compiler /work/index.js ./
COPY --from=compiler /work/openapi.yml ./
COPY --from=git-rev /work/git_revision.txt ./
COPY --from=optimizer /work/docker-cmd-with-crond.sh ./

CMD ["sh", "docker-cmd-with-crond.sh"]
