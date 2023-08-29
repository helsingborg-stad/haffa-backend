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
RUN yarn install --production --ignore-optional

FROM gcr.io/distroless/nodejs:18
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

CMD ["index.js"]
