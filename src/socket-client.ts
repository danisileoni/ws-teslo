import {Manager, Socket} from 'socket.io-client';

let socket: Socket;

export const connectToServer = (token: string) => {
  const manager = new Manager('localhost:3000/socket.io/socket.io.js', {
    extraHeaders: {
      authorization: token,
    }
  });

  socket?.removeAllListeners();
  socket = manager.socket('/');

  addListeners();
}

const addListeners = () => {
  const clientsUl = document.querySelector<HTMLOListElement>('#clients-ul');
  const messageForm = document.querySelector<HTMLFormElement>('#message-form');
  const messageInput = document.querySelector<HTMLInputElement>('#message-input');
  const messagesUl = document.querySelector<HTMLOListElement>('#messages-ul');
  const serverStatusLabel = document.querySelector<HTMLSpanElement>('#server-status');

  socket.on('connect', () => {
    serverStatusLabel.innerHTML = 'connected';
  });

  socket.on('disconnect', () => {
    serverStatusLabel.innerHTML = 'disconnected';
  });

  socket.on('clients-updated', (clients: string[]) => {
    let clientsHtml = '';
    clients.forEach(clientId => {
      clientsHtml += `
        <li>${clientId}</li>
      `
    });
    clientsUl.innerHTML = clientsHtml;
  });

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (messageInput.value.trim().length <= 0) return;

    socket.emit('message-form-client', {
      id: 'io!',
      message: messageInput.value
    });
    messageInput.value = '';
  });

  socket.on('message-form-server', (payload: { fullName: string, message: string }) => {
    const newMessage = `
      <li>
        <strong>${payload.fullName}</strong>
        <spam>${payload.message}</spam>
      </li>
    `

    const li = document.createElement('li');
    li.innerHTML = newMessage;
    messagesUl?.append(li);
  });
}