ARG ARCH 
FROM ${ARCH}/node:20-alpine3.20 as build

WORKDIR /home/node/build 
COPY . .
RUN npm install
RUN npm run build

FROM ${ARCH}/node:20-alpine3.20 as app
RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY --from=build /home/node/build/dist .
COPY --from=build /home/node/build/package*.json .

RUN  chown -R node:node /home/node/app

USER node

RUN npm install --omit=dev

ENTRYPOINT ["node", "app/app.js"]