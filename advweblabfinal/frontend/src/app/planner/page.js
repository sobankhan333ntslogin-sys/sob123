'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { apiCall } from '../../lib/api';
import { Calendar, Plus, Trash2, Save, X, Search, Clock, ChevronRight } from 'lucide-react';

export default function MealPlanner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [meals, setMeals] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState('');
  const [allRecipes, setAllRecipes] = useState([]);
  const [modalSearch, setModalSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchMealPlan = async () => {
    try {
      const response = await apiCall('/mealplans');
      if (response.success && response.data) {
        setMeals(response.data.meals);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch meal plan');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecipes = async () => {
    try {
      const response = await apiCall('/recipes');
      if (response.success) {
        setAllRecipes(response.data);
      }
    } catch (err) {
      console.error('Failed to load search recipes:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMealPlan();
      fetchAllRecipes();
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');

    // Format meals payload with IDs
    const payloadMeals = {};
    Object.keys(meals).forEach((day) => {
      payloadMeals[day] = meals[day].map((recipe) => recipe._id || recipe);
    });

    try {
      const response = await apiCall('/mealplans', {
        method: 'PUT',
        body: { meals: payloadMeals },
      });

      if (response.success) {
        setMeals(response.data.meals);
        setSuccessMsg('Meal plan saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to save meal plan');
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = (day) => {
    setActiveDay(day);
    setIsModalOpen(true);
  };

  const addRecipeToDay = (recipe) => {
    // Check if recipe is already added to this day
    const alreadyExists = meals[activeDay].some((r) => r._id === recipe._id);
    if (alreadyExists) {
      alert('Recipe is already added to this day.');
      return;
    }

    setMeals((prev) => ({
      ...prev,
      [activeDay]: [...prev[activeDay], recipe],
    }));
    setIsModalOpen(false);
    setModalSearch('');
  };

  const removeRecipeFromDay = (day, recipeId) => {
    setMeals((prev) => ({
      ...prev,
      [day]: prev[day].filter((recipe) => recipe._id !== recipeId),
    }));
  };

  // Filter recipes for modal selection
  const filteredRecipes = allRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(modalSearch.toLowerCase()) ||
    recipe.category.toLowerCase().includes(modalSearch.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            Weekly Meal Planner
            <Calendar size={24} className="text-orange-500" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">Design your week, balance your diet, and organize cooking in advance.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all active:scale-95"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Meal Plan'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Week Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-5">
        {days.map((day) => (
          <div key={day} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col h-[400px]">
            {/* Day Header */}
            <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-3 shrink-0">
              <span className="font-extrabold text-sm text-gray-900">{day}</span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">{meals[day]?.length || 0} meals</span>
            </div>

            {/* Meals Container */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-1">
              {meals[day] && meals[day].length > 0 ? (
                meals[day].map((recipe) => (
                  <div key={recipe._id} className="group p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-100 transition-all relative">
                    <Link href={`/recipes/${recipe._id}`} className="block">
                      <h4 className="font-bold text-xs text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">
                        {recipe.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] text-gray-400 font-medium">
                        <Clock size={10} />
                        <span>{recipe.prepTime + recipe.cookTime}m</span>
                        <span>&bull;</span>
                        <span>{recipe.category}</span>
                      </div>
                    </Link>
                    {/* Delete button */}
                    <button
                      onClick={() => removeRecipeFromDay(day, recipe._id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white border border-transparent hover:border-gray-100 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <span className="text-xs text-gray-400 italic">Empty</span>
                </div>
              )}
            </div>

            {/* Add button */}
            <button
              onClick={() => openAddModal(day)}
              className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-gray-200 hover:border-orange-300 text-gray-400 hover:text-orange-500 text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0"
            >
              <Plus size={14} /> Add Recipe
            </button>
          </div>
        ))}
      </div>

      {/* Add Recipe Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[500px] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg text-gray-900">
                Add to <span className="text-orange-500">{activeDay}</span>
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setModalSearch('');
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search */}
            <div className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 p-1">
              <Search className="text-gray-400 ml-2" size={16} />
              <input
                type="text"
                placeholder="Search recipes to add..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full px-3 py-2 text-xs text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Modal List */}
            <div className="flex-grow overflow-y-auto space-y-2.5 pr-1">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    onClick={() => addRecipeToDay(recipe)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:border-orange-200 border border-gray-100 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 group-hover:text-orange-600 transition-colors">
                          {recipe.title}
                        </h4>
                        <span className="text-[10px] text-gray-400">{recipe.category} &bull; {recipe.difficulty}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-gray-400 py-8">No recipes found matching "{modalSearch}"</p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
