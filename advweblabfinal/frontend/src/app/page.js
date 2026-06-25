'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../lib/api';
import { Search, Heart, Clock, Award, Star, Flame, Sparkles, RefreshCw } from 'lucide-react';

export default function Home() {
  const { user, toggleFavorite } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  const [cacheStatus, setCacheStatus] = useState(false);
  const [popularCacheStatus, setPopularCacheStatus] = useState(false);
  const [error, setError] = useState('');

  // Fetch standard recipes (with filters)
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (selectedDifficulty) queryParams.append('difficulty', selectedDifficulty);

      const response = await apiCall(`/recipes?${queryParams.toString()}`);
      if (response.success) {
        setRecipes(response.data);
        setCacheStatus(response.cached || false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch popular recipes
  const fetchPopularRecipes = async () => {
    setPopularLoading(true);
    try {
      const response = await apiCall('/recipes/popular');
      if (response.success) {
        setPopularRecipes(response.data);
        setPopularCacheStatus(response.cached || false);
      }
    } catch (err) {
      console.error('Failed to load popular recipes:', err.message);
    } finally {
      setPopularLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await apiCall('/recipes/categories');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPopularRecipes();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRecipes();
    }, 300); // Debounce search for smoother UX

    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, selectedDifficulty]);

  const handleFavoriteClick = async (e, recipeId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to add to favorites');
      return;
    }
    const res = await toggleFavorite(recipeId);
    if (!res.success) {
      alert(res.error);
    }
  };

  const isFavorite = (recipeId) => {
    if (!user || !user.favorites) return false;
    return user.favorites.some((fav) => (fav._id || fav) === recipeId);
  };

  return (
    <div className="w-full pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100/60 border border-orange-200 text-orange-600 text-xs font-semibold mb-6 animate-bounce">
            <Sparkles size={12} />
            Explore over 5,000+ hand-picked recipes
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Discover and Organize <br className="hidden sm:inline" />
            Your Next <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Culinary Masterpiece</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto font-light">
            RecipeHub helps you browse amazing dishes, create weekly meal plans, share your own recipes, and organize your favorite meals easily.
          </p>

          {/* Combined Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-orange-500/5 border border-gray-100 p-2 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-300">
              <Search className="text-gray-400 ml-3" size={20} />
              <input
                type="text"
                placeholder="Search recipes, ingredients, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm sm:text-base"
              />
              <button 
                onClick={fetchRecipes}
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all duration-300"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Browse Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                <span>Filter Recipes</span>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('');
                    setSelectedDifficulty('');
                  }}
                  className="text-xs font-semibold text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Reset All
                </button>
              </h3>

              {/* Category Filters */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                      selectedCategory === ''
                        ? 'bg-orange-500 text-white font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                        selectedCategory === cat
                          ? 'bg-orange-500 text-white font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filters */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['', 'Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 px-1 rounded-xl text-xs text-center border font-semibold transition-all duration-200 ${
                        selectedDifficulty === diff
                          ? 'bg-orange-500 text-white border-orange-500 font-bold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {diff === '' ? 'All' : diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recipe Grid */}
          <div className="lg:col-span-3">
            {/* Header with Cache Indicators */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  Browse Recipes
                  {cacheStatus && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold tracking-wider uppercase shadow-sm animate-pulse">
                      ⚡ Cache Hit
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500">Showing {recipes.length} delicious recipes</p>
              </div>
              <button 
                onClick={fetchRecipes}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-orange-200 transition-all"
              >
                <RefreshCw size={12} />
                Refresh List
              </button>
            </div>

            {loading ? (
              /* Loading Skeletons */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 4].map((i) => (
                  <div key={i} className="bg-white rounded-3xl h-96 border border-gray-100 animate-pulse p-4 space-y-4">
                    <div className="w-full h-48 bg-gray-200 rounded-2xl" />
                    <div className="h-6 w-2/3 bg-gray-200 rounded-md" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded-md" />
                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                      <div className="h-4 w-16 bg-gray-200 rounded-md" />
                      <div className="h-4 w-16 bg-gray-200 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-red-600">
                {error}
              </div>
            ) : recipes.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-16 text-center text-gray-500 max-w-lg mx-auto">
                <Flame className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-800">No Recipes Found</h3>
                <p className="text-sm mt-1">Try tweaking your filters or search keywords to find what you are craving.</p>
              </div>
            ) : (
              /* Recipes Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recipes.map((recipe) => (
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
                      <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[11px] font-bold text-gray-800 uppercase tracking-wider shadow-sm">
                        {recipe.category}
                      </span>
                      {/* Favorite button */}
                      <button
                        onClick={(e) => handleFavoriteClick(e, recipe._id)}
                        className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-sm ${
                          isFavorite(recipe._id)
                            ? 'bg-red-500 text-white scale-110'
                            : 'bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white'
                        }`}
                      >
                        <Heart size={16} fill={isFavorite(recipe._id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 mb-2">
                        <span>by {recipe.user?.name || 'Chef'}</span>
                        <span>&bull;</span>
                        <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                      </div>
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
        </div>
      </section>

      {/* Featured/Popular Recipes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 sm:p-12 shadow-xl shadow-orange-500/10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full -ml-20 -mb-20 blur-2xl" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-black flex items-center gap-2">
                Popular Dishes
                {popularCacheStatus && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
                    ⚡ Cache Hit
                  </span>
                )}
              </h2>
              <p className="text-orange-100 font-light mt-1 text-sm sm:text-base">Top-rated items loved by the RecipeHub community.</p>
            </div>
            <button 
              onClick={fetchPopularRecipes}
              className="text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 flex items-center gap-1.5 transition-colors font-semibold"
            >
              <RefreshCw size={12} />
              Reload Popular
            </button>
          </div>

          {popularLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/10 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  href={`/recipes/${recipe._id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full text-gray-900"
                >
                  <div className="relative h-36 w-full">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-orange-500 text-[10px] font-bold text-white uppercase tracking-wider">
                      {recipe.category}
                    </span>
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <h3 className="font-extrabold text-sm text-gray-900 line-clamp-1 group-hover:text-orange-500 transition-colors">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center justify-between mt-4 text-[11px] text-gray-500 border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-orange-500" />
                        <span>{recipe.prepTime + recipe.cookTime} mins</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-800 font-bold">
                        <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                        <span>{recipe.averageRating}</span>
                        <span className="font-normal text-gray-400">({recipe.ratingsCount})</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
