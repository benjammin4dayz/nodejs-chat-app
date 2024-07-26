connect(window.location.origin);

function connect(url, retryTime = 1000) {
  const { messageBox, messageInput, messageSubmit } = pageElements();
  const chat = new WebSocket(url);

  const addMessage = message => {
    const el = document.createElement('div');
    el.className = 'text-bubble';
    el.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    messageBox.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  chat.onopen = () => {
    retryTime = 1000; // reset to initial value
  };

  chat.onclose = () => {
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

  chat.onmessage = event => {
    addMessage(event.data);
  };

  messageSubmit.onclick = () => {
    if (!messageInput.value) return;
    chat.send(messageInput.value);
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
