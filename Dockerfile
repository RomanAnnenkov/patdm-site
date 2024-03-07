FROM node:18-alpine
RUN mkdir -p /home/node/app/node_modules /home/node/app/logs /home/node/app/storage && chown -R node:node /home/node/app
RUN apk update && apk --no-cache add tzdata curl
ENV TZ=Europe/Moscow

WORKDIR /home/node/app
COPY package*.json ./
USER node
COPY --chown=node:node . .
RUN npm install
EXPOSE 4000
CMD [ "node", "server.js" ]

