// fe/src/context/AuthContext.tsx
'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/status/`, {
            withCredentials: true,
        });
        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = () => setIsAuthenticated(true);
  
  const logout = async () => {
    try {
        await axios.post(`${API_BASE_URL}/logout/`, {}, { withCredentials: true });
    } finally {
        setIsAuthenticated(false);
        window.location.href = '/'; 
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
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