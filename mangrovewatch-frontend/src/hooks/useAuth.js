import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, verifyAuth as apiVerifyAuth } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('officer_token') || '');
  const [isOfficer, setIsOfficer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkExistingToken() {
      if (!token) {
        setIsOfficer(false);
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiVerifyAuth();
        if (res && res.valid) {
          setIsOfficer(true);
        } else {
          setIsOfficer(false);
          localStorage.removeItem('officer_token');
          setToken('');
        }
      } catch (err) {
        // If offline / mock or failed, keep local token if present
        setIsOfficer(Boolean(token));
      } finally {
        setIsLoading(false);
      }
    }

    checkExistingToken();
  }, [token]);

  const login = async (inputToken) => {
    try {
      const res = await apiLogin(inputToken);
      if (res && res.token) {
        localStorage.setItem('officer_token', res.token);
        setToken(res.token);
        setIsOfficer(true);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      // Fallback for offline/demo if token matches default officer token
      if (inputToken === 'mangrovewatch-officer-secret-2024') {
        localStorage.setItem('officer_token', inputToken);
        setToken(inputToken);
        setIsOfficer(true);
        return { success: true };
      }
      return { success: false, message: err.message || 'Authentication failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('officer_token');
    setToken('');
    setIsOfficer(false);
  };

  return (
    <AuthContext.Provider value={{ token, isOfficer, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
