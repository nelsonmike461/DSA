import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user`, {
        withCredentials: true,
      });
      setUser(res.data);
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    // credentials:  { username, password}

    try {
      const res = await axios.post(`${API_BASE_URL}/login/`, credentials, {
        withCredentials: true,
      });
      await checkAuth();
      return res;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data) => {
    // data: {username, password, confirm_password}

    try {
      const res = await axios.post(`${API_BASE_URL}/register/`, data, {
        withCredentials: true,
      });
      return res;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/logout/`,
        {},
        {
          withCredentials: true,
        }
      );
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
