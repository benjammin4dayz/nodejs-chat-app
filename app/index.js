require('dotenv').config();
const { WebSocketServer } = require('ws');
const fs = require('fs');
const http = require('http');
const path = require('path');

// resolve env config
const HOST = process.env['HOST'] || 'localhost';
const USE_SSL = String(process.env['USE_SSL']).toLowerCase() === 'true';
const HTTP_PORT = Number.parseInt(process.env['HTTP_PORT']) || 80;
const CHAT_PORT = Number.parseInt(process.env['CHAT_PORT']) || 8000;

// start the websocket server for the chat room
const chatServer = new WebSocketServer({ port: CHAT_PORT });

// simple name assignment to distinguish between users in chat
let seqChat = 0;
const getUsername = () => `Chatter ${++seqChat}`;

// handle new client connections
chatServer.on('connection', ws => {
  const getUserCount = () => chatServer.clients.size + ' active';
  const broadcast = message => {
    console.log(message);
    chatServer.clients.forEach(client => {
      client.readyState === ws.OPEN && client.send(message);
    });
  };

  // assign a username to the client upon connection
  const user = getUsername();
  ws.send(`[PRIVATE] Welcome to the chat, ${user}!`);
  broadcast(`[SYSTEM] ${user} joined the chat (${getUserCount()})`);

  // handle client disconnects
  ws.on('close', () => {
    broadcast(`[SYSTEM] ${user} left the chat (${getUserCount()})`);
  });

  // handle messages from this client
  ws.on('message', data => {
    const messageContent = data.toString('utf8');
    if (!messageContent) return; // do not accept empty messages

    // prefix the user's assigned name to their message content and send it
    broadcast(`${user}: ${messageContent}`);
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
      JSON.stringify([
        {
          name: 'Main',
          url: `${USE_SSL ? 'wss' : 'ws'}://${HOST}:${CHAT_PORT}`,
        },
      ])
    );
    return;
  }

  // serve static files from public/
  const filePath = path.join(
    __dirname,
    'public',
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
