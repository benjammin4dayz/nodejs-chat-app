FROM alpine:3.16.9

RUN apk add --no-cache nodejs npm

WORKDIR /usr/src/app

COPY ./public ./public
COPY ./app.js ./
COPY package*.json ./

RUN npm ci

CMD ["npm", "start"]