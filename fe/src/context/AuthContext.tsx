'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/axios';

type LoginValues = Record<'username' | 'password', string>; 
interface AuthContextType {
  isAuthenticated: boolean;
  login: (values: LoginValues) => Promise<boolean>; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = async (values: LoginValues): Promise<boolean> => {
    try {
      await api.post('/login/', values);
      setIsAuthenticated(true); 
      return true;
    } catch (error) {
      console.error("Falha na autenticação:", error);
      setIsAuthenticated(false);
      return false; 
    }
  };
  
  const logout = async () => {
    try {
      await api.post('/logout/');
    } catch (error) {
      console.error("Logout no backend falhou:", error);
    } finally {
      setIsAuthenticated(false);
      Cookies.remove('sessionid');
      Cookies.remove('csrftoken');
      //window.location.href = '/'; 
    }
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}