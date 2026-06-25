'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSocket } from '../context/SocketContext';
import NotificationToast from './NotificationToast';

const ToastContainer = () => {
  const socketCtx = useSocket();
  const { notifications = [], removeNotification } = socketCtx || {};
  const [mounted, setMounted] = useState(false);
  // Track which notifications have already been shown as toasts
  const [shownIds, setShownIds] = useState(new Set());
  const [activeToasts, setActiveToasts] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Watch for new notifications and add them as toasts
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const latest = notifications[0];
    const id = latest.timestamp + latest.message;

    if (!shownIds.has(id)) {
      setShownIds((prev) => new Set([...prev, id]));
      setActiveToasts((prev) => [{ ...latest, toastId: id }, ...prev]);
    }
  }, [notifications]);

  const handleClose = useCallback((toastId) => {
    setActiveToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  if (!mounted || activeToasts.length === 0 || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {activeToasts.slice(0, 3).map((toast) => (
        <div key={toast.toastId} className="pointer-events-auto">
          <NotificationToast
            notification={toast}
            onClose={() => handleClose(toast.toastId)}
          />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
