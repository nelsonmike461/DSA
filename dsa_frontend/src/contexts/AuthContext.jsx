import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      await api.post("/token/refresh/", {}, { withCredentials: true });
      return await checkAuth();
    } catch (error) {
      setUser(null);
      return false;
    }
  }, [checkAuth]);

  // Initialize auth only if tokens are present
  useEffect(() => {
    const initializeAuth = async () => {
      if (
        !document.cookie.includes("access_token") &&
        !document.cookie.includes("refresh_token")
      ) {
        setLoading(false);
        return;
      }
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        await handleSilentRefresh();
      }
    };
    initializeAuth();
  }, [checkAuth, handleSilentRefresh]);

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
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
