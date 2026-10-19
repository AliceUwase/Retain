import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler } from '../services/apiClient';
import * as authService from '../services/authService';
import type { PublicUser } from '../types';

interface AuthContextValue {
  user: PublicUser | null;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // the user saved at login, so a refresh shows the app straight away instead of the login page
  const [user, setUser] = useState(authService.getCurrentUser);

  function signOut() {
    authService.signOut();
    setUser(null);
  }

  useEffect(() => {
    // any request answered 401 with a token means it expired, so the user is logged out
    setUnauthorizedHandler(signOut);

    // checks the saved token with the API once on load; a 401 runs the handler above,
    // and other failures (like being offline) keep the saved user
    if (authService.getCurrentUser()) {
      authService.fetchCurrentUser().then(setUser).catch(() => {});
    }

    return () => setUnauthorizedHandler(null);
  }, []);

  async function signUp(name: string, email: string, password: string) {
    setUser(await authService.signUp(name, email, password));
  }

  async function signIn(email: string, password: string, remember: boolean) {
    setUser(await authService.signIn(email, password, remember));
  }

  return <AuthContext value={{ user, signUp, signIn, signOut }}>{children}</AuthContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
