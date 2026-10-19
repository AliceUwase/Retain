import type { PublicUser } from '../types';
import { api } from './apiClient';
import { clearSession, getSavedUser, saveSession, updateSavedUser } from './session';

interface AuthResponse {
  user: PublicUser;
  token: string;
}

export const getCurrentUser = getSavedUser;

export async function signIn(email: string, password: string, remember: boolean): Promise<PublicUser> {
  const { user, token } = await api<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password, remember },
  });
  saveSession(token, user, remember);
  return user;
}

// new accounts are normal users, logged in straight away (and remembered)
export async function signUp(name: string, email: string, password: string): Promise<PublicUser> {
  const { user, token } = await api<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
  saveSession(token, user, true);
  return user;
}

// asks the API who the saved token belongs to; fails with 401 if the token has expired
export async function fetchCurrentUser(): Promise<PublicUser> {
  const { user } = await api<{ user: PublicUser }>('/api/auth/me');
  updateSavedUser(user);
  return user;
}

// admin overview only
export function getUsers(): Promise<PublicUser[]> {
  return api<PublicUser[]>('/api/admin/users');
}

// the server keeps no session, so logging out means forgetting the token 
export function signOut(): void {
  clearSession();
}
