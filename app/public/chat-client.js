fetch(window.location.origin + '/rooms')
  .then(res => res.json())
  .then(rooms => {
    connect(rooms[0].url);
  });

function connect(url) {
  const socket = new WebSocket(url);

  const addMessage = (message, { timestamp = true } = {}) => {
    const el = document.createElement('div');
    el.className = 'text-bubble';
    el.innerText = `${
      timestamp ? `[${new Date().toLocaleTimeString()}] ` : ''
    }${message}`;
    $('messageBox').appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  socket.onopen = () => {
    addMessage('Welcome to the chat room!');
  };

  socket.onclose = () => {
    addMessage('Disconnected...');
    setTimeout(() => connect(url), 1000);
  };

  socket.onmessage = event => {
    addMessage(event.data);
  };

  $('messageSendButton').onclick = () => {
    const message = $('chatInput').value;
    socket.send(message);
    $('chatInput').value = '';
  };
}

function $(id) {
  return document.getElementById(id);
}
