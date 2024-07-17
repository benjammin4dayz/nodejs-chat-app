# Node.js Chat App

A basic realtime chat application that runs on Node.js or in a Docker container.

The client and user interface is written in html/css/js and served from the base route of the app `/`.

The server supports multiple clients and provides each of them with a unique identity which is generated upon connection. It shares messages between all clients connected to the chat room and broadcasts when a user connects or disconnects.

## Getting Started

Clone the repo

```bash
git clone https://github.com/benjammin4dayz/nodejs-chat-app
cd nodejs-chat-app
```

### Node.js

Install dependencies

```bash
npm ci
```

Develop

```bash
npm run dev
```

Run the app

```bash
npm start
```

### Docker

<!-- docker build -t benjammin4dayz/nodejs-chat-app:tag . -->

#### Example using docker run:

```bash
docker run -p 80:80 -p 8000:8000 benjammin4dayz/nodejs-chat-app
```

#### Example using [docker-compose](./docker-compose.yml):

```bash
docker compose up
```
