import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setAccessToken } from '../api/fetchClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await apiFetch('/auth/refresh', { method: 'POST' });
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (name, email, password, role) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    setAccessToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);