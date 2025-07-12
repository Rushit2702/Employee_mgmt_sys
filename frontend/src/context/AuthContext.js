import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  const login = (userData, sessionId) => {
    setUser(userData);
    setSessionId(sessionId);
    localStorage.setItem('sessionId', sessionId);
  };

  const logout = async () => {
    try {
      if (sessionId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSessionId(null);
      localStorage.removeItem('token');
      localStorage.removeItem('sessionId');
      window.location.href = '/login';
    }
  };

  const validateSession = async () => {
    const token = localStorage.getItem('token');
    const storedSessionId = localStorage.getItem('sessionId');
    
    if (!token || !storedSessionId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/validate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: storedSessionId })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSessionId(data.sessionId);
      } else {
        // Session invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('sessionId');
    } finally {
      setLoading(false);
    }
  };

  // Only logout on tab/browser close or refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      logout();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId]);

  // Validate session on app load
  useEffect(() => {
    validateSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 