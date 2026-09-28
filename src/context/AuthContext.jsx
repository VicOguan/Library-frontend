import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { parseJwt } from '../utils/jwt';

const AuthContext = createContext();

const getInitialUser = (initialToken) => {
  if (!initialToken) return null;
  const decoded = parseJwt(initialToken);
  if (decoded && decoded.exp * 1000 > Date.now()) {
    return { username: decoded.sub, role: decoded.role };
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => getInitialUser(localStorage.getItem('token')));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback((newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decoded = parseJwt(newToken);
    if (decoded && decoded.exp * 1000 > Date.now()) {
      setUser({ username: decoded.sub, role: decoded.role });
    }
  }, []);

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (!decoded || decoded.exp * 1000 <= Date.now()) {
        logout();
      }
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);