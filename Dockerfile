FROM alpine:3.20.1

RUN apk add --no-cache nodejs npm

WORKDIR /usr/src
COPY ./app ./app
COPY package*.json ./
RUN npm ci

EXPOSE 80 8000
CMD ["npm", "start"]