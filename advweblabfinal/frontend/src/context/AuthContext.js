'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiCall } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await apiCall('/auth/me');
      if (response.success) {
        setUser(response.data);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Session expired or invalid token');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      if (response.success) {
        localStorage.setItem('token', response.token);
        await fetchProfile();
        return { success: true };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      if (response.success) {
        localStorage.setItem('token', response.token);
        await fetchProfile();
        return { success: true };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  };

  const toggleFavoriteOnUser = async (recipeId) => {
    if (!user) return { success: false, error: 'Must be logged in' };
    try {
      const response = await apiCall(`/recipes/${recipeId}/favorite`, {
        method: 'POST',
      });
      if (response.success) {
        // Update user state favorites list
        setUser((prev) => ({
          ...prev,
          favorites: response.isFavorite
            ? [...prev.favorites, { _id: recipeId }]
            : prev.favorites.filter((fav) => (fav._id || fav) !== recipeId),
        }));
        return { success: true, isFavorite: response.isFavorite };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        fetchProfile,
        toggleFavorite: toggleFavoriteOnUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
