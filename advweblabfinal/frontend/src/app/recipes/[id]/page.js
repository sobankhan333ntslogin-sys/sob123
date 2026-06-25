'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { apiCall } from '../../../lib/api';
import { Clock, Award, Users, Heart, ArrowLeft, Star, Edit, Trash2, MessageSquare, Send, Check, Wifi } from 'lucide-react';

export default function RecipeDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user, toggleFavorite } = useAuth();
  const { joinRecipeRoom, leaveRecipeRoom, onRecipeEvent } = useSocket() || {};

  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Checklist states
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [checkedSteps, setCheckedSteps] = useState({});

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRecipeDetails = async () => {
    try {
      const recipeRes = await apiCall(`/recipes/${id}`);
      if (recipeRes.success) {
        setRecipe(recipeRes.data);
      }
      const reviewsRes = await apiCall(`/reviews/recipe/${id}`);
      if (reviewsRes.success) {
        setReviews(reviewsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  // --- SOCKET.IO: Join this recipe's room for live review updates ---
  useEffect(() => {
    if (!id || !joinRecipeRoom) return;

    joinRecipeRoom(id);

    // When any user posts a review on this recipe, add it to the feed
    const offPosted = onRecipeEvent('review_posted', ({ review, recipeId }) => {
      if (recipeId !== id) return;
      setReviews((prev) => {
        // Avoid duplicates (in case the poster also sees it)
        if (prev.some((r) => r._id === review._id)) return prev;
        return [review, ...prev];
      });
    });

    // When a review is deleted, remove it from feed
    const offDeleted = onRecipeEvent('review_deleted', ({ reviewId }) => {
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    });

    return () => {
      leaveRecipeRoom(id);
      offPosted();
      offDeleted();
    };
  }, [id, joinRecipeRoom, leaveRecipeRoom, onRecipeEvent]);

  const handleFavorite = async () => {
    if (!user) {
      alert('Please log in to add to favorites');
      return;
    }
    const res = await toggleFavorite(recipe._id);
    if (!res.success) {
      alert(res.error);
    }
  };

  const isFavorite = () => {
    if (!user || !user.favorites || !recipe) return false;
    return user.favorites.some((fav) => (fav._id || fav) === recipe._id);
  };

  const handleDeleteRecipe = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    try {
      const response = await apiCall(`/recipes/${recipe._id}`, {
        method: 'DELETE',
      });
      if (response.success) {
        router.push('/');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);

    if (!comment.trim()) {
      setReviewError('Please write a comment');
      setSubmittingReview(false);
      return;
    }

    try {
      const response = await apiCall(`/reviews/recipe/${recipe._id}`, {
        method: 'POST',
        body: { rating, comment },
      });

      if (response.success) {
        setComment('');
        setRating(5);
        // The review will appear via socket event for OTHER users;
        // for the poster, just refresh recipe to get updated rating too
        await fetchRecipeDetails();
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const response = await apiCall(`/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (response.success) {
        await fetchRecipeDetails();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleStepCheck = (idx) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-gray-900">Error Loading Recipe</h2>
        <p className="text-gray-500 mt-2">{error || 'Recipe not found'}</p>
        <Link href="/" className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold">
          <ArrowLeft size={16} /> Back to Browse
        </Link>
      </div>
    );
  }

  const isOwner = user && (recipe.user?._id === user.id || recipe.user === user.id || user.role === 'admin');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back navigation */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Browse
      </Link>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5/12): Image, Meta, Owner actions, Review formulation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
            <div className="relative h-80 rounded-2xl overflow-hidden mb-6 bg-gray-100">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleFavorite}
                className={`absolute top-4 right-4 p-3 rounded-2xl shadow-md transition-all duration-300 ${
                  isFavorite()
                    ? 'bg-red-500 text-white scale-110'
                    : 'bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white'
                }`}
              >
                <Heart size={18} fill={isFavorite() ? 'currentColor' : 'none'} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-2">
              {recipe.title}
            </h1>
            
            <p className="text-sm text-gray-500 mb-6 font-light">{recipe.description}</p>

            {/* Quick Metadata Box */}
            <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-4 mb-6 text-center text-xs text-gray-500">
              <div className="flex flex-col items-center gap-1.5">
                <Clock size={16} className="text-orange-500" />
                <span className="font-bold text-gray-800">{recipe.prepTime + recipe.cookTime} mins</span>
                <span className="text-[10px]">Prep: {recipe.prepTime}m &bull; Cook: {recipe.cookTime}m</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Award size={16} className="text-orange-500" />
                <span className="font-bold text-gray-800">{recipe.difficulty}</span>
                <span className="text-[10px]">Difficulty</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Users size={16} className="text-orange-500" />
                <span className="font-bold text-gray-800">{recipe.servings} Servings</span>
                <span className="text-[10px]">Yield</span>
              </div>
            </div>

            {/* Chef info */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Uploaded by {recipe.user?.name || 'Chef'}</span>
              <span>Category: <strong className="text-gray-700 font-bold uppercase">{recipe.category}</strong></span>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 mt-6">
                <Link
                  href={`/recipes/${recipe._id}/edit`}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-bold text-gray-700 transition-all"
                >
                  <Edit size={16} />
                  Edit Recipe
                </Link>
                <button
                  onClick={handleDeleteRecipe}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-sm font-bold text-red-600 transition-all"
                >
                  <Trash2 size={16} />
                  Delete Recipe
                </button>
              </div>
            )}
          </div>

          {/* Add a Review Form */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-orange-500" />
              Write a Review
            </h3>

            {user ? (
              <form onSubmit={handleAddReview} className="space-y-4">
                {reviewError && (
                  <p className="text-xs text-red-500 font-semibold">{reviewError}</p>
                )}

                {/* Stars selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform duration-200"
                      >
                        <Star
                          size={24}
                          fill={star <= rating ? '#f59e0b' : 'none'}
                          stroke={star <= rating ? '#f59e0b' : '#9ca3af'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment area */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Comment</label>
                  <textarea
                    rows={3}
                    placeholder="Share your thoughts about this recipe... Did you make any changes?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/10 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Send size={14} />
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">Please log in to submit a rating and review.</p>
                <Link href="/login" className="inline-block mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm">
                  Login Here
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7/12): Ingredients, Steps, and Review feeds */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Ingredients list */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-6 pb-2 border-b border-gray-50">Ingredients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipe.ingredients.map((ing, index) => (
                <div
                  key={index}
                  onClick={() => toggleIngredientCheck(index)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all duration-300 ${
                    checkedIngredients[index]
                      ? 'bg-orange-50/50 border-orange-200 text-gray-400 line-through decoration-orange-300'
                      : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all mt-0.5 ${
                    checkedIngredients[index]
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-white border-gray-300 text-transparent'
                  }`}>
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-sm font-medium leading-tight">{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions steps */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-6 pb-2 border-b border-gray-50">Cooking Instructions</h2>
            <div className="space-y-4">
              {recipe.instructions.map((step, index) => (
                <div
                  key={index}
                  onClick={() => toggleStepCheck(index)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer select-none transition-all duration-300 ${
                    checkedSteps[index]
                      ? 'bg-orange-50/50 border-orange-200 text-gray-400 line-through decoration-orange-300'
                      : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border transition-all ${
                    checkedSteps[index]
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-orange-100 border-orange-200 text-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium leading-relaxed mt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Community Reviews feed */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-2">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                Reviews ({reviews.length})
                {/* Live indicator badge */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </h2>
              <div className="flex items-center gap-1 font-bold text-xs text-gray-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                <Star size={16} fill="#f59e0b" stroke="#f59e0b" />
                <span>{recipe.averageRating > 0 ? recipe.averageRating : 'New'}</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No reviews yet. Be the first to cook and review this dish!</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((rev) => {
                  const revOwner = user && (rev.user?._id === user.id || rev.user === user.id || user.role === 'admin');
                  return (
                    <div key={rev._id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 relative">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs uppercase">
                            {(rev.user?.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-800">{rev.user?.name || 'Chef'}</span>
                            <span className="text-[10px] text-gray-400 block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 font-bold text-xs text-gray-800 bg-white px-2 py-1 rounded-lg border border-gray-100">
                          <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 font-light pl-1">{rev.comment}</p>

                      {/* Delete review button */}
                      {revOwner && (
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="absolute bottom-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
