import { mockUsers } from '../data/mockData';
import type { PublicUser, User } from '../types';
import { delay, loadList, newId, now, saveList } from './storage';

const KEY = 'users';
const SESSION_KEY = 'retain:session'; // the logged-in user

function load(): User[] {
  return loadList(KEY, mockUsers);
}

function toPublic({ id, name, email, role, createdAt }: User): PublicUser {
  return { id, name, email, role, createdAt };
}

// remember me: localStorage survives closing the browser, sessionStorage doesn't
function saveSession(user: PublicUser, remember: boolean): void {
  signOut();
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(user));
}

// admin dashboard only
export async function getUsers(): Promise<PublicUser[]> {
  await delay();
  return load().map(toPublic);
}

// whoever is logged in, or null
export function getCurrentUser(): PublicUser | null {
  const saved = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  return saved ? (JSON.parse(saved) as PublicUser) : null;
}

export async function signIn(email: string, password: string, remember: boolean): Promise<PublicUser> {
  await delay();
  const user = load().find((u) => u.email === email.trim().toLowerCase() && u.password === password);
  if (!user) throw new Error('Incorrect email or password.');

  saveSession(toPublic(user), remember);
  return toPublic(user);
}

// new accounts are normal users, logged in straight away
export async function signUp(name: string, email: string, password: string): Promise<PublicUser> {
  await delay();
  const users = load();
  const cleanEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email === cleanEmail)) throw new Error('An account with this email already exists.');

  const user: User = { id: newId('u'), name: name.trim(), email: cleanEmail, password, role: 'user', createdAt: now() };
  saveList(KEY, [...users, user]);
  saveSession(toPublic(user), true);
  return toPublic(user);
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
