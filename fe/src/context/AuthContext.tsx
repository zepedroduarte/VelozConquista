'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import api from '@/lib/axios';

type LoginValues = Record<'username' | 'password', string>;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (values: LoginValues) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = async (values: LoginValues) => {
    try {
      const res = await api.post("/token/", {
        username: values.username,
        password: values.password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      setIsAuthenticated(true);

      return true;
    } catch (error) { 
      console.error("Erro no login:", error);
      return false; 
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};