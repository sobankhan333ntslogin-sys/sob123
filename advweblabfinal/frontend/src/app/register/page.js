'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Register() {
  const { user, register, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If logged in, redirect to home
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setSubmitting(false);
      return;
    }

    const res = await register(name, email, password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 p-8 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-4">
            <User size={24} />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Create Account</h2>
          <p className="text-sm text-gray-500 mt-1.5">Join RecipeHub to save favorites and plan meals.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-medium">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 p-1 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-300">
              <User className="text-gray-400 ml-3" size={16} />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 p-1 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-300">
              <Mail className="text-gray-400 ml-3" size={16} />
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
            <div className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 p-1 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-300">
              <Lock className="text-gray-400 ml-3" size={16} />
              <input
                type="password"
                required
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 p-1 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-300">
              <Lock className="text-gray-400 ml-3" size={16} />
              <input
                type="password"
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
          >
            {submitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-orange-500 hover:underline">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}
