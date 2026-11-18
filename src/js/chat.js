export class ChatWebSocket {
  constructor(url, currentUser, handlers = {}) {
    this.url = url;
    this.currentUser = currentUser;
    this.handlers = handlers;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 8;
    this.manuallyClosed = false;
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.openedAt = null;
    this.visibilityHandler = null;
  }

  connect() {
    if (this.manuallyClosed) return;

    const wsUrl = `${this.url}?userId=${encodeURIComponent(this.currentUser.id)}`;
    this.handlers.onConnecting?.(this.reconnectAttempts);
    this.ws = new WebSocket(wsUrl);

    this.ws.addEventListener('open', () => {
      console.log('[WS] connected:', wsUrl);
      this.openedAt = Date.now();
      this.reconnectAttempts = 0;
      this.startPing();
      this.handlers.onOpen?.();
    });

    this.ws.addEventListener('message', (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error('[WS] invalid message:', event.data, e);
        return;
      }

      // Совместимость с оригинальным сервером: массив = список пользователей
      if (Array.isArray(data)) {
        this.handlers.onUsersUpdate?.(data);
        return;
      }

      if (data.type === 'users') {
        this.handlers.onUsersUpdate?.(data.users);
        return;
      }

      if (data.type === 'history') {
        this.handlers.onHistory?.(data.messages);
        return;
      }

      if (data.type === 'send') {
        this.handlers.onMessage?.(data);
      }
    });

    this.ws.addEventListener('close', (event) => {
      const lifetime = this.openedAt ? Date.now() - this.openedAt : 0;
      console.log(`[WS] disconnected, code: ${event.code}, lifetime: ${lifetime}ms`);
      this.openedAt = null;
      this.stopPing();

      // Application-level close: сессия истекла — не переподключаемся
      if (event.code === 4001) {
        this.handlers.onUnauthorized?.();
        return;
      }

      if (this.manuallyClosed) {
        this.handlers.onDisconnected?.();
        return;
      }

      // Транспортный разрыв (в т.ч. 1006): exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
        this.reconnectAttempts += 1;
        console.log(`[WS] reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
        this.handlers.onReconnecting?.(this.reconnectAttempts, delay);
        this.reconnectTimer = setTimeout(() => this.connect(), delay);
      } else {
        this.handlers.onDisconnected?.();
      }
    });

    this.ws.addEventListener('error', (err) => {
      console.error('[WS] error', err);
    });

    // При возврате на вкладку — проверить, что соединение живо
    if (!this.visibilityHandler) {
      this.visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
          if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
            console.log('[WS] tab visible, forcing reconnect');
            this.reconnectAttempts = 0;
            this.connect();
          } else if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
          }
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  // Клиентский keepalive: шлём {type:"ping"} каждые 10s,
  // чтобы Render-прокси не закрывал соединение по idle timeout.
  startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 10000);
  }

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  sendMessage(text) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'send', message: text }));
      return true;
    }
    return false;
  }

  close() {
    this.manuallyClosed = true;
    this.stopPing();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
