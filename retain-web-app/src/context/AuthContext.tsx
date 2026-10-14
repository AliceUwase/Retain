import { createContext, useContext, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import type { PublicUser } from '../types';

interface AuthContextValue {
  user: PublicUser | null;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // read the saved session so a refresh doesn't log a useer out
  const [user, setUser] = useState(authService.getCurrentUser);

  async function signUp(name: string, email: string, password: string) {
    setUser(await authService.signUp(name, email, password));
  }

  async function signIn(email: string, password: string) {
    setUser(await authService.signIn(email, password));
  }

  function signOut() {
    authService.signOut();
    setUser(null);
  }

  return <AuthContext value={{ user, signUp, signIn, signOut }}>{children}</AuthContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
