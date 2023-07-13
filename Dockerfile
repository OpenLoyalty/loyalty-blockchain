FROM node:18.16-bullseye

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app
RUN apt-get install curl

WORKDIR /usr/src/node-app

COPY package.json ./

USER node

COPY --chown=node:node . .

RUN yarn install
ENTRYPOINT ["/bin/sh", "-c", "cd /usr/src/node-app/src && npx prisma generate && npx prisma migrate deploy && cd /usr/src/node-app && exec \"$@\"", "--"]

EXPOSE 3000
