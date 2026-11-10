import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLoginUser, logoutUser as apiLogoutUser, getStoredUser } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => sessionStorage.getItem('medicore_auth_token'));

  // Listen for storage or custom auth changes
  useEffect(() => {
    const syncAuth = () => {
      setUser(getStoredUser());
      setToken(sessionStorage.getItem('medicore_auth_token'));
    };

    window.addEventListener('storage', syncAuth);
    window.addEventListener('medicore-auth-change', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('medicore-auth-change', syncAuth);
    };
  }, []);

  const login = async (credentials) => {
    const response = await apiLoginUser(credentials);
    const userData = response.data?.user || {
      email: credentials.email,
      role: credentials.role || 'PATIENT',
      name: credentials.email.split('@')[0],
    };
    const sessionToken = response.data?.token || `token_${Date.now()}`;

    setUser(userData);
    setToken(sessionToken);
    window.dispatchEvent(new Event('medicore-auth-change'));
    return userData;
  };

  const logout = () => {
    apiLogoutUser();
    setUser(null);
    setToken(null);
    window.dispatchEvent(new Event('medicore-auth-change'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
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

export default AuthContext;

