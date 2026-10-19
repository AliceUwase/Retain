import { getToken } from './session';

// set in .env.local for local work and in Vercel's settings for the live site; read when the app is built
const BASE_URL = import.meta.env.VITE_API_URL as string | undefined;

// an error that keeps the HTTP status, so callers can react to e.g. 404 differently from 500
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// AuthContext registers a function here, so an expired token anywhere in the app logs the user out
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  // becomes ?key=value; empty values are left out, so "All categories" sends no category at all
  query?: Record<string, string | number | undefined>;
}

// every call to the backend goes through here: it adds the base URL, the token and JSON handling,
// and turns the API's { error } responses into a thrown Error with that message
export async function api<T>(path: string, { method = 'GET', body, query }: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) throw new Error('VITE_API_URL is not set, so the app does not know where the API is.');

  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const token = getToken();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    // fetch itself only fails when there's no answer at all (offline, server down, or blocked by CORS)
    throw new Error("Can't reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T; // "done", with no body

  const data = await response.json().catch(() => null); // a non-JSON reply becomes null instead of crashing
  if (!response.ok) {
    // only when a token was sent: a failed login is also a 401, but there's no session to end then
    if (response.status === 401 && token) onUnauthorized?.();
    throw new ApiError(response.status, data?.error ?? `Request failed (${response.status}).`);
  }
  return data as T;
}
