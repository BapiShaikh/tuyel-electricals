import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tuyel_user')); }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('tuyel_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.success) {
        localStorage.setItem('tuyel_token', data.data.token);
        localStorage.setItem('tuyel_user', JSON.stringify(data.data.user));
        setToken(data.data.token);
        setUser(data.data.user);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tuyel_token');
    localStorage.removeItem('tuyel_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

