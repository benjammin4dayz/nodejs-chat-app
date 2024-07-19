fetch(window.location.origin + '/rooms')
  .then(res => res.json())
  .then(rooms => {
    connect(rooms[0].url);
  });

function connect(url, retryTime = 1000) {
  const { messageBox, messageInput, messageSubmit } = pageElements();
  const socket = new WebSocket(url);

  const addMessage = message => {
    const el = document.createElement('div');
    el.className = 'text-bubble';
    el.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    messageBox.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  // connected to chat server
  socket.onopen = () => {
    retryTime = 1000; // reset to initial value
  };

  // disconnected from chat server
  socket.onclose = () => {
    if (retryTime === 1000) {
      addMessage('Disconnected...');
    } else {
      addMessage('Attempting to reconnect...');
    }

    // random time added to stagger attempts if clients disconnected together
    const exponentialBackoffTime =
      Math.min(retryTime * 2, 60000) + Math.random() * 900 + 100;

    // attempt to reconnect
    setTimeout(() => connect(url, exponentialBackoffTime), retryTime);
  };

  // received new message from chat server
  socket.onmessage = event => {
    addMessage(event.data);
  };

  // send new message to chat server
  messageSubmit.onclick = () => {
    if (!messageInput.value) return;
    socket.send(messageInput.value);
    messageInput.value = '';
  };
}

function pageElements() {
  const $ = id => {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`Missing element with ID: '${id}'`);
    }
    return el;
  };

  return {
    messageBox: $('messageBox'),
    messageInput: $('messageInput'),
    messageSubmit: $('messageSubmit'),
  };
}
