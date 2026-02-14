import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../api/axios'; // Ensure this path is correct

// Define the shape of the User object
interface User {
  username: string;
  user_id: number;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, userData: User) => void; // UPDATED to accept userData
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check Local Storage on load
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_data');

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // UPDATED LOGIN FUNCTION
  const login = (accessToken: string, refreshToken: string, userData: User) => {
    // 1. Save Tokens
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    
    // 2. Save User Data
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // 3. Update State
    setUser(userData);
    setIsAuthenticated(true);

    // 4. Update Axios defaults
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    
    setUser(null);
    setIsAuthenticated(false);
    
    delete api.defaults.headers.common['Authorization'];
    
    // Optional: Redirect to login manually if needed, 
    // but usually the UI handles this via protected routes.
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};