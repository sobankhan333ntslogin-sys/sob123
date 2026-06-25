'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { apiCall } from '../../../../lib/api';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function EditRecipe() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(20);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState('Medium');
  const [category, setCategory] = useState('Dinner');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Vegan', 'Beverages'];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await apiCall(`/recipes/${id}`);
        if (response.success) {
          const recipe = response.data;
          
          // Verify owner or admin
          const isOwner = user && (recipe.user?._id === user.id || recipe.user === user.id || user.role === 'admin');
          if (!isOwner && !authLoading) {
            router.push(`/recipes/${id}`);
            return;
          }

          setTitle(recipe.title);
          setDescription(recipe.description);
          setPrepTime(recipe.prepTime);
          setCookTime(recipe.cookTime);
          setServings(recipe.servings);
          setDifficulty(recipe.difficulty);
          setCategory(recipe.category);
          setImage(recipe.image || '');
          setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : ['']);
          setInstructions(recipe.instructions.length > 0 ? recipe.instructions : ['']);
        }
      } catch (err) {
        setError(err.message || 'Failed to load recipe details');
      } finally {
        setFetching(false);
      }
    };

    if (user) {
      fetchRecipe();
    }
  }, [id, user, authLoading, router]);

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredientField = (index) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const addInstructionField = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstructionField = (index) => {
    if (instructions.length === 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const cleanedIngredients = ingredients.filter((ing) => ing.trim() !== '');
    const cleanedInstructions = instructions.filter((step) => step.trim() !== '');

    if (cleanedIngredients.length === 0) {
      setError('Please add at least one ingredient');
      setSubmitting(false);
      return;
    }

    if (cleanedInstructions.length === 0) {
      setError('Please add at least one cooking instruction');
      setSubmitting(false);
      return;
    }

    const payload = {
      title,
      description,
      ingredients: cleanedIngredients,
      instructions: cleanedInstructions,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      difficulty,
      category,
      image,
    };

    try {
      const response = await apiCall(`/recipes/${id}`, {
        method: 'PUT',
        body: payload,
      });

      if (response.success) {
        router.push(`/recipes/${id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update recipe');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || fetching) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-orange-500 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6 sm:p-10">
        
        {/* Header */}
        <div className="mb-8 border-b border-gray-100 pb-5">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            Edit Your Recipe
            <Sparkles size={20} className="text-orange-500" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">Make changes to improve your recipe details.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Recipe Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grandma's Famous Lasagna"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="A brief description of this recipe..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Timing, Servings, Difficulty & Category */}
            <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Prep Time (min)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cook Time (min)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Servings</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Image URL with Preview */}
          <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-2/3 space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ImageIcon size={14} /> Recipe Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-3 text-sm text-gray-700 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="w-28 h-28 rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={32} className="text-gray-300" />
              )}
            </div>
          </div>

          {/* Dynamic Ingredients */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
              <h3 className="font-extrabold text-gray-900">Ingredients</h3>
              <button
                type="button"
                onClick={addIngredientField}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-xs font-bold text-orange-600 border border-orange-100 transition-all"
              >
                <Plus size={14} /> Add Ingredient
              </button>
            </div>
            
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2 cups all-purpose flour"
                    value={ing}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <button
                    type="button"
                    disabled={ingredients.length === 1}
                    onClick={() => removeIngredientField(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Instructions */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
              <h3 className="font-extrabold text-gray-900">Cooking Steps</h3>
              <button
                type="button"
                onClick={addInstructionField}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-xs font-bold text-orange-600 border border-orange-100 transition-all"
              >
                <Plus size={14} /> Add Step
              </button>
            </div>

            <div className="space-y-3">
              {instructions.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0 mt-2">{index + 1}</span>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Mix the flour and sugar..."
                    value={step}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <button
                    type="button"
                    disabled={instructions.length === 1}
                    onClick={() => removeInstructionField(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-all shrink-0 mt-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-98 disabled:opacity-50 transition-all duration-300"
          >
            {submitting ? 'Saving Changes...' : 'Save Recipe Details'}
          </button>
        </form>

      </div>
    </div>
  );
}
