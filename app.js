require('dotenv').config();
const { WebSocketServer } = require('ws');
const fs = require('fs');
const http = require('http');
const path = require('path');

// resolve env config
const HOSTNAME = process.env['HOST'] || 'localhost';
const HTTP_PORT = process.env['HTTP_PORT'] || 80;
const CHAT_PORT = process.env['CHAT_PORT'] || 8000;

// start the websocket server for the chat room
const chatServer = new WebSocketServer({ port: CHAT_PORT });

// simple name assignment to distinguish between users in chat
let seqChat = 0;
const getUsername = () => `Chatter ${++seqChat}`;

// handle new client connections
chatServer.on('connection', ws => {
  // assign a username to the client upon connection
  const user = getUsername();
  console.log(`[SERVER] ${user} connected`);

  // broadcast that a new user has joined the chat room
  chatServer.clients.forEach(client => {
    client.readyState === ws.OPEN &&
      client.send(`BROADCAST: ${user} joined the chat`);
  });

  // broadcast that a user has left the chat room
  ws.on('close', () => {
    chatServer.clients.forEach(client => {
      client.readyState === ws.OPEN &&
        client.send(`BROADCAST: ${user} left the chat`);
    });
  });

  // handle messages from this client
  ws.on('message', data => {
    const messageContent = data.toString('utf8');

    // do not accept empty messages
    if (messageContent) {
      // prefix the user's assigned name to their message content
      const message = `${user}: ${messageContent}`;
      console.log(message);

      // forward this client's messages to all open clients
      chatServer.clients.forEach(client => {
        client.readyState === ws.OPEN && client.send(message);
      });
    }
  });

  // log errors from this client in the server console
  ws.on('error', error => {
    console.log('[CLIENT] Error: ', error);
  });
});

// configure http server route handlers
const httpServer = http.createServer((req, res) => {
  // client can GET this route to determine the websocket address
  if (req.url === '/rooms') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify([{ name: 'Main', url: `ws://${HOSTNAME}:${CHAT_PORT}` }])
    );
    return;
  }

  // serve static files from public/
  const filePath = path.join(
    __dirname,
    './public',
    req.url === '/' ? 'index.html' : req.url
  );

  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal server error');
        console.log(err);
        return;
      }

      res.writeHead(200, { 'Content-Type': getContentType(filePath) });
      res.end(data);
    });
  });
});

// start the http server to handle web requests
httpServer.listen(HTTP_PORT, () =>
  console.log(`Server started on port ${HTTP_PORT}`)
);

function getContentType(filePath) {
  const extension = path.extname(filePath);

  switch (extension) {
    case '.html':
      return 'text/html';
    case '.js':
      return 'text/javascript';
    case '.css':
      return 'text/css';
    default:
      return 'application/octet-stream';
  }
}
