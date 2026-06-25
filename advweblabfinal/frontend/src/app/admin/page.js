'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiCall } from '../../lib/api';
import { LayoutDashboard, Users, BookOpen, MessageSquare, Tag, Trash2, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    users: 0,
    recipes: 0,
    reviews: 0,
    categories: 0,
  });
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  const fetchAdminData = async () => {
    try {
      const statsRes = await apiCall('/admin/stats');
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      const usersRes = await apiCall('/admin/users');
      if (usersRes.success) {
        setUsersList(usersRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleDeleteUser = async (userId) => {
    if (!confirm('WARNING: Deleting this user will delete all of their recipes, reviews, and meal plans. Are you sure?')) return;
    setError('');
    setSuccess('');

    try {
      const response = await apiCall(`/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        setSuccess('User and associated data deleted successfully.');
        await fetchAdminData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
          Admin Control Center
          <LayoutDashboard size={24} className="text-orange-500" />
        </h1>
        <p className="text-sm text-gray-500 mt-1">Monitor site activity, statistics, and manage registered users.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold animate-pulse">
          {success}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Stats */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <span className="text-2xl font-black text-gray-900">{stats.users}</span>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
          </div>
        </div>

        {/* Recipes Stats */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-2xl font-black text-gray-900">{stats.recipes}</span>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Recipes</p>
          </div>
        </div>

        {/* Reviews Stats */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <span className="text-2xl font-black text-gray-900">{stats.reviews}</span>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Reviews</p>
          </div>
        </div>

        {/* Categories Stats */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center">
            <Tag size={20} />
          </div>
          <div>
            <span className="text-2xl font-black text-gray-900">{stats.categories}</span>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories</p>
          </div>
        </div>
      </div>

      {/* Users Management List */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 mb-6">User Accounts</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Joined Date</th>
                <th className="pb-3 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usersList.map((usr) => (
                <tr key={usr._id} className="text-xs text-gray-700 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 pl-2 font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {usr.name.charAt(0)}
                    </div>
                    <span>{usr.name}</span>
                  </td>
                  <td className="py-4 font-light">{usr.email}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                      usr.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-4 font-light">{new Date(usr.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 text-right pr-4">
                    {usr._id !== user.id ? (
                      <button
                        onClick={() => handleDeleteUser(usr._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-semibold italic pr-2">Your Account</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
