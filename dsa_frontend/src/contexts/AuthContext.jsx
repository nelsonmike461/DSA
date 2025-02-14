import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if the user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get("/user");
      setUser(res.data);
      return true;
    } catch (error) {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Attempt silent refresh of tokens
  const handleSilentRefresh = useCallback(async () => {
    try {
      await api.post("/token/refresh/");
      return await checkAuth();
    } catch (error) {
      setUser(null);
      return false;
    }
  }, [checkAuth]);

  // Initial authentication check on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        await handleSilentRefresh();
      }
    };
    initializeAuth();
  }, [checkAuth, handleSilentRefresh]);

  // Start an interval to silently refresh the token (e.g., every 4 minutes)
  useEffect(() => {
    let interval;
    if (user) {
      interval = setInterval(() => {
        handleSilentRefresh();
      }, 4 * 60 * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, handleSilentRefresh]);

  const login = async (credentials) => {
    try {
      const res = await api.post("/login/", credentials);
      await checkAuth();
      return res;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post("/register/", data);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout/");
      setUser(null);
      document.cookie =
        "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
