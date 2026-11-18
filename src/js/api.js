import { SERVER_URL } from './config.js';

/**
 * Регистрация пользователя на сервере.
 * @param {string} name — никнейм
 * @returns {Promise<{status: string, user?: {id: string, name: string}, message?: string}>}
 */
export async function registerUser(name) {
  const response = await fetch(`${SERVER_URL}/new-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Не удалось зарегистрироваться');
  }

  return data;
}
