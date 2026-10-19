import type { PublicUser } from '../types';

// the login token and the user it belongs to, kept together in the browser.
// "remember me" picks localStorage (survives closing the browser) over sessionStorage (cleared when it closes)
const TOKEN_KEY = 'retain:token';
const USER_KEY = 'retain:user';

export function saveSession(token: string, user: PublicUser, remember: boolean): void {
  clearSession(); // so an old session in the other storage can't linger
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

// the user saved at login, so the app can show them straight away after a refresh
export function getSavedUser(): PublicUser | null {
  if (!getToken()) return null;
  const saved = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  return saved ? (JSON.parse(saved) as PublicUser) : null;
}

// updates the saved user 
export function updateSavedUser(user: PublicUser): void {
  const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
  }
}
