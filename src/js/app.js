import { WS_URL } from "./config.js";
import { registerUser } from "./api.js";
import { saveUser, getUser, clearUser } from "./storage.js";
import {
  showModal,
  hideModal,
  showChat,
  hideChat,
  showError,
  clearError,
  clearMessages,
  renderUsers,
  renderMessage,
  setConnectionStatus,
} from "./ui.js";
import { ChatWebSocket } from "./chat.js";

let currentUser = null;
let chatWS = null;

function startChat(user) {
  currentUser = user;

  hideModal();
  showChat();
  clearMessages();
  clearError();
  setConnectionStatus("info", "Подключение…");

  const headerUser = document.getElementById("chat-header-user");
  if (headerUser) {
    headerUser.textContent = `Вы: ${user.name}`;
  }

  chatWS = new ChatWebSocket(WS_URL, currentUser, {
    onConnecting: (attempt) => {
      if (attempt === 0) {
        setConnectionStatus("info", "Подключение…");
      } else {
        setConnectionStatus("info", `Переподключение (попытка ${attempt})…`);
      }
    },
    onOpen: () => {
      setConnectionStatus("info", "");
    },
    onReconnecting: (attempt, delay) => {
      setConnectionStatus(
        "info",
        `Соединение потеряно. Переподключение через ${Math.round(delay / 1000)} с…`
      );
    },
    onDisconnected: () => {
      setConnectionStatus(
        "error",
        "Не удалось подключиться к серверу. Обновите страницу."
      );
    },
    onUsersUpdate: (users) => renderUsers(users),
    onHistory: (history) => {
      clearMessages();
      history.forEach((msg) => renderMessage(msg, currentUser));
    },
    onMessage: (msg) => renderMessage(msg, currentUser),
    onUnauthorized: () => {
      clearUser();
      currentUser = null;
      if (chatWS) {
        chatWS.close();
        chatWS = null;
      }
      hideChat();
      showModal();
      showError("Сессия истекла, войдите заново");
    },
  });

  chatWS.connect();
  document.getElementById("message-input").focus();
}

function bindLoginForm() {
  const loginBtn = document.getElementById("login-btn");
  const nicknameInput = document.getElementById("nickname");

  const doLogin = async () => {
    const name = nicknameInput.value.trim();
    if (!name) {
      showError("Введите никнейм");
      return;
    }

    clearError();
    loginBtn.disabled = true;

    try {
      const result = await registerUser(name);
      if (result.status === "ok" && result.user) {
        saveUser(result.user);
        startChat(result.user);
      } else {
        showError(result.message || "Не удалось войти");
      }
    } catch (err) {
      showError(err.message || "Ошибка соединения с сервером");
    } finally {
      loginBtn.disabled = false;
    }
  };

  loginBtn.addEventListener("click", doLogin);
  nicknameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });
}

function bindLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", () => {
    // Закрываем WS — сервер удалит пользователя из онлайна
    if (chatWS) {
      chatWS.close();
      chatWS = null;
    }

    // Очищаем сессию
    clearUser();
    currentUser = null;

    // Сбрасываем UI
    clearMessages();
    renderUsers([]);
    setConnectionStatus("info", "");
    hideChat();
    showModal();
    clearError();

    const nicknameInput = document.getElementById("nickname");
    nicknameInput.value = "";
    nicknameInput.focus();
  });
}

function bindMessageForm() {
  const form = document.getElementById("message-form");
  const input = document.getElementById("message-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!chatWS) return;

    const text = input.value.trim();
    if (!text) return;

    const ok = chatWS.sendMessage(text);
    if (ok) {
      input.value = "";
    } else {
      setConnectionStatus("error", "Нет соединения, сообщение не отправлено");
    }
    input.focus();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindLoginForm();
  bindLogout();
  bindMessageForm();

  const savedUser = getUser();
  if (savedUser) {
    startChat(savedUser);
  } else {
    showModal();
  }
});