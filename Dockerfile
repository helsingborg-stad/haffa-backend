FROM node:18 as compiler
ARG GITHUB_ACCESS_TOKEN
WORKDIR /work
COPY . ./
COPY deploy.npmrc .npmrc
RUN yarn install && yarn build


FROM node:18 as git-rev
WORKDIR /work
COPY .git .git
RUN git rev-parse --short HEAD >  git_revision.txt

FROM node:18-alpine	as optimizer
ARG GITHUB_ACCESS_TOKEN
WORKDIR /work
COPY . ./
COPY deploy.npmrc .npmrc
RUN yarn install --production --ignore-optional --platform=linux --arch=x64

#FROM gcr.io/distroless/nodejs18-debian11
FROM node:18-alpine
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

