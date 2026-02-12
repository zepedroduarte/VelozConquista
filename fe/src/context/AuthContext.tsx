'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import api from '@/lib/axios';
import Cookies from 'js-cookie';

type LoginValues = Record<'username' | 'password', string>;

interface AuthContextType {
  isAuthenticated: boolean;
  login: (values: LoginValues) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!Cookies.get('is_logged_in'));

  const login = async (values: LoginValues) => {
    try {
      await api.get("/csrf/");
      await api.post('/login/', values);
      
      Cookies.set('is_logged_in', 'true', { expires: 1, secure: true }); 
      setIsAuthenticated(true);
      return true;
    } catch (error) { 
      console.error("Erro no login:", error);
      return false; 
    }
  };

  const logout = async () => {
    try { 
      await api.get("/csrf/");
      await api.post('/logout/'); 
    } finally { 
      Cookies.remove('is_logged_in');
      setIsAuthenticated(false); 
      window.location.href = '/'; 
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};