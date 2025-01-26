'use client';

import { createContext, useContext } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, loading, error] = useAuthState(auth);

  if (error) {
    console.error('Auth error:', error);
  }

  return (
    <AuthContext.Provider value={{ user: user || null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 