const USER_KEY = 'chat_user';

export function saveUser(user) {
  try {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('[storage] failed to save user:', e);
  }
}

export function getUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('[storage] failed to read user:', e);
    return null;
  }
}

export function clearUser() {
  try {
    sessionStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('[storage] failed to clear user:', e);
  }
}
