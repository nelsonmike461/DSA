import React, { createContext, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // A flag to ensure we only try silent refresh once per mount.
  const [hasAttemptedSilentRefresh, setHasAttemptedSilentRefresh] =
    useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Function to check authentication status via the /user endpoint.
  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get("/user");
      setUser(res.data);
      return true;
    } catch (error) {
      setUser(null);
      return false;
    }
  }, []);

  // Function to silently refresh tokens.
  const handleSilentRefresh = useCallback(async () => {
    try {
      await api.post("/token/refresh/", {}, { withCredentials: true });
      return await checkAuth();
    } catch (error) {
      setUser(null);
      return false;
    }
  }, [checkAuth]);

  // contexts/AuthContext.jsx
  useEffect(() => {
    const initializeAuth = async () => {
      if (location.pathname === "/login" || location.pathname === "/register") {
        setLoading(false);
        return;
      }

      try {
        await checkAuth(); // Interceptor handles token refresh if needed
      } catch (error) {
        setUser(null);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [checkAuth, location.pathname, navigate]);

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
