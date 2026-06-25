'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Utensils, Calendar, Heart, PlusCircle, User,
  LogOut, LogIn, LayoutDashboard, Bell, Star, ChefHat,
  Wifi, X
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const socketCtx = useSocket();
  const { onlineCount = 0, notifications = [], clearNotifications, removeNotification } = socketCtx || {};
  const pathname = usePathname();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const isActive = (path) => pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive(path)
        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
        : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
    }`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.length;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                <Utensils size={20} className="animate-pulse" />
              </div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-gray-800 to-gray-950 bg-clip-text text-transparent">
                Recipe<span className="text-orange-500">Hub</span>
              </span>
            </Link>

            {/* Main Nav Links */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/" className={linkClass('/')}>
                Browse
              </Link>
              {user && (
                <>
                  <Link href="/planner" className={linkClass('/planner')}>
                    <Calendar size={16} />
                    Meal Planner
                  </Link>
                  <Link href="/favorites" className={linkClass('/favorites')}>
                    <Heart size={16} />
                    Favorites
                  </Link>
                  <Link href="/recipes/new" className={linkClass('/recipes/new')}>
                    <PlusCircle size={16} />
                    Upload Recipe
                  </Link>
                </>
              )}
              {user && user.role === 'admin' && (
                <Link href="/admin" className={linkClass('/admin')}>
                  <LayoutDashboard size={16} />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right side: online count + bell + auth */}
          <div className="flex items-center gap-3">

            {/* 🟢 Live Online Users Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {onlineCount} online
            </div>

            {/* 🔔 Notification Bell */}
            <div className="relative" ref={bellRef}>
              <button
                id="notification-bell-btn"
                onClick={() => setBellOpen((p) => !p)}
                className="relative p-2 rounded-xl text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <Bell size={14} className="text-orange-500" />
                      Live Activity
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => { clearNotifications(); setBellOpen(false); }}
                        className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <Bell size={28} className="mb-2 opacity-30" />
                        <p className="text-sm font-medium">No activity yet</p>
                        <p className="text-xs mt-1">Real-time events will appear here</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                            n.type === 'new_review'
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                              : 'bg-gradient-to-br from-orange-500 to-red-500'
                          }`}>
                            {n.type === 'new_review'
                              ? <Star size={14} fill="white" stroke="white" />
                              : <ChefHat size={14} />
                            }
                          </div>
                          {/* Message */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2">{n.message}</p>
                            {n.type === 'new_review' && n.rating && (
                              <div className="flex items-center gap-0.5 mt-1">
                                {Array.from({ length: 5 }).map((_, si) => (
                                  <Star key={si} size={10} className={si < n.rating ? 'text-amber-400' : 'text-gray-200'} fill={si < n.rating ? '#fbbf24' : 'none'} />
                                ))}
                              </div>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {/* Remove */}
                          <button
                            onClick={() => removeNotification(i)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-gray-500 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Auth Section */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-orange-500 transition-all duration-300"
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all duration-300"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
