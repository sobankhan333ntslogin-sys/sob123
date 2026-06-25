'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiCall } from '../../lib/api';
import { Heart, Clock, Award, Star, Flame, Sparkles } from 'lucide-react';

export default function Favorites() {
  const { user, loading, toggleFavorite, fetchProfile } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleFavoriteClick = async (e, recipeId) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggleFavorite(recipeId);
    if (!res.success) {
      setError(res.error);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const favorites = user?.favorites || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            My Favorite Recipes
            <Heart size={24} className="text-red-500 fill-red-500" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quick access to all the recipes you have saved.</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 border border-gray-200 text-gray-600 font-semibold text-xs rounded-xl hover:text-orange-500 hover:border-orange-200 transition-all"
        >
          Discover More Recipes
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center text-gray-500 max-w-lg mx-auto shadow-sm">
          <Heart className="mx-auto text-gray-200 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-800">No Favorites Yet</h3>
          <p className="text-sm mt-1 max-w-xs mx-auto">Click the heart icon on any recipe cards to save them here for quick access.</p>
          <Link href="/" className="inline-block mt-6 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/15">
            Browse Recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe) => (
            <Link 
              key={recipe._id} 
              href={`/recipes/${recipe._id}`}
              className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              {/* Image */}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Category Badge */}
                <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[11px] font-bold text-gray-800 uppercase tracking-wider shadow-sm animate-fade-in">
                  {recipe.category}
                </span>
                {/* Favorite toggle */}
                <button
                  onClick={(e) => handleFavoriteClick(e, recipe._id)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-red-500 text-white scale-110 shadow-sm transition-all duration-300"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-1 mb-2">
                  {recipe.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-light">
                  {recipe.description}
                </p>

                {/* Info Row */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-orange-500" />
                    <span>{recipe.prepTime + recipe.cookTime} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award size={14} className="text-orange-500" />
                    <span>{recipe.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-gray-800">
                    <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                    <span>{recipe.averageRating > 0 ? recipe.averageRating : 'New'}</span>
                    <span className="font-normal text-gray-400">({recipe.ratingsCount})</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
