import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { api } from './api.js';

const AuthContext = createContext(null);

/**
 * Holds the signed-in account. The session itself lives in an httpOnly cookie
 * the server sets, so this only keeps the answer to "who am I".
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, setupRequired: false });

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setState({ loading: false, user: data.user, setupRequired: Boolean(data.setupRequired) });
    } catch {
      setState({ loading: false, user: null, setupRequired: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = {
    ...state,
    async login(email, password) {
      const data = await api.post('/auth/login', { email, password });
      setState({ loading: false, user: data.user, setupRequired: false });
      return data.user;
    },
    async createFirstAdmin(payload) {
      const data = await api.post('/auth/setup', payload);
      setState({ loading: false, user: data.user, setupRequired: false });
      return data.user;
    },
    async logout() {
      try {
        await api.post('/auth/logout');
      } catch {
        /* the local state is what matters next */
      }
      setState({ loading: false, user: null, setupRequired: false });
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
