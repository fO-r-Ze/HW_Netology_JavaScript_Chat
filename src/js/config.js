// Бэкенд, задеплоенный на Render
export const SERVER_URL = 'https://netology-chat.onrender.com';

// WebSocket-URL получается заменой протокола https → wss
export const WS_URL = SERVER_URL.replace(/^https/, 'wss').replace(/^http/, 'ws');
