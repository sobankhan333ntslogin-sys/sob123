'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, user }) => {
  const socketRef = useRef(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Connect / reconnect when user changes
  useEffect(() => {
    // If there's an existing socket, clean it up first
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Always connect (even anonymous users count toward online presence)
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected:', socket.id);
      // Identify this user to the server
      if (user) {
        socket.emit('user_connected', { userId: user._id, name: user.name });
      }
    });

    socket.on('user_count', (count) => {
      setOnlineCount(count);
    });

    socket.on('new_notification', (notification) => {
      // Don't show notification to the user who triggered it
      if (user && notification.userName === user.name) return;
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, user?.name]); // reconnect when user identity changes

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const joinRecipeRoom = useCallback((recipeId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_recipe_room', recipeId);
    }
  }, []);

  const leaveRecipeRoom = useCallback((recipeId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_recipe_room', recipeId);
    }
  }, []);

  const onRecipeEvent = useCallback((event, handler) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineCount,
        notifications,
        clearNotifications,
        removeNotification,
        joinRecipeRoom,
        leaveRecipeRoom,
        onRecipeEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
