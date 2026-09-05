import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('ratehub_user')) ?? null; } catch { return null; } });
  const [loading, setLoading] = useState(false);
  async function login(credentials) { setLoading(true); try { const { data } = await api.post('/auth/login', credentials); localStorage.setItem('ratehub_token', data.data.token); localStorage.setItem('ratehub_user', JSON.stringify(data.data.user)); setUser(data.data.user); return data.data.user; } finally { setLoading(false); } }
  async function register(values) {
    setLoading(true);
    try {
      const payload = { ...values };
      if (payload.accountType !== 'ADMIN') {
        delete payload.adminCode;
      }
      if (payload.accountType !== 'OWNER') {
        delete payload.storeName;
        delete payload.storeEmail;
        delete payload.storeAddress;
        delete payload.storeCategory;
        delete payload.storeDescription;
      }
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('ratehub_token', data.data.token);
      localStorage.setItem('ratehub_user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      return data.data.user;
    } finally {
      setLoading(false);
    }
  }
  function logout() { localStorage.removeItem('ratehub_token'); localStorage.removeItem('ratehub_user'); setUser(null); }
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
