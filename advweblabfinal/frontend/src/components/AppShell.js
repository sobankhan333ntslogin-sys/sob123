'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import Navbar from './Navbar';
import ToastContainer from './ToastContainer';

/**
 * AppShell sits inside AuthProvider so it can read the user,
 * then passes it down to SocketProvider so the socket knows who is online.
 */
const AppShell = ({ children }) => {
  const { user } = useAuth();

  return (
    <SocketProvider user={user}>
      <Navbar />
      <ToastContainer />
      {children}
    </SocketProvider>
  );
};

export default AppShell;
