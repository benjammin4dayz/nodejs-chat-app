require('dotenv').config();
const http = require('http');
const { join } = require('path');
const serveStatic = require('serve-static');
const { WebSocketServer } = require('ws');

// resolve env config
const PORT = Number.parseInt(process.env.PORT) || 80;

// configure http static server
const server = http.createServer((req, res) => {
  const publicRoot = join(__dirname, 'public');
  serveStatic(publicRoot, {
    index: 'index.html',
  })(req, res, err => {
    if (!err) {
      // redirect missed requests back to the base url
      res.writeHead(302, { Location: '/' });
      res.end();
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Error');
    }
  });
});

// configure the websocket for the chat room
const wss = new WebSocketServer({ server });

// simple name assignment to distinguish between users in chat
let seqChat = 0;
const getUsername = () => `Chatter ${++seqChat}`;

// handle new client connections
wss.on('connection', ws => {
  const getUserCount = () => wss.clients.size + ' active';
  const broadcast = message => {
    console.log(message);
    wss.clients.forEach(client => {
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

// start the http server to handle web requests
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
