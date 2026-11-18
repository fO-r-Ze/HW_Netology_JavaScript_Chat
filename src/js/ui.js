export function showModal() {
  document.getElementById('modal').classList.remove('hidden');
}

export function hideModal() {
  document.getElementById('modal').classList.add('hidden');
}

export function showChat() {
  document.getElementById('chat-container').classList.remove('hidden');
}

export function hideChat() {
  document.getElementById('chat-container').classList.add('hidden');
}

export function showError(message) {
  document.getElementById('error-msg').textContent = message;
}

export function clearError() {
  document.getElementById('error-msg').textContent = '';
}

export function clearMessages() {
  document.getElementById('messages').innerHTML = '';
}

export function renderUsers(users) {
  const list = document.getElementById('users-list');
  list.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = user.name;
    list.appendChild(li);
  });
}

export function renderMessage(message, currentUser) {
  const container = document.getElementById('messages');
  const div = document.createElement('div');
  div.classList.add('message');

  const isOwn = currentUser && message.user && message.user.id === currentUser.id;
  if (isOwn) {
    div.classList.add('own');
  }

  const author = document.createElement('div');
  author.classList.add('author');
  author.textContent = isOwn ? 'You' : message.user.name;

  const text = document.createElement('div');
  text.classList.add('text');
  text.textContent = message.message;

  div.appendChild(author);
  div.appendChild(text);
  container.appendChild(div);

  container.scrollTop = container.scrollHeight;
}

export function setConnectionStatus(kind, message) {
  const el = document.getElementById('connection-status');
  if (!el) return;
  el.textContent = message || '';
  el.className = `connection-status ${kind}`;
  el.classList.toggle('hidden', !message);
}
