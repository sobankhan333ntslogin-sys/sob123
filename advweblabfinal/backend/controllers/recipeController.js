const Recipe = require('../models/Recipe');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { getCache, setCache, clearCache } = require('../config/cache');
const { getIO } = require('../socket/socketManager');

// Helper to invalid cache
const invalidateRecipeCaches = async () => {
  await clearCache();
};

// @desc    Get all recipes (with search & filtering)
// @route   GET /api/recipes
// @access  Public
exports.getRecipes = asyncHandler(async (req, res, next) => {
  const { search, category, difficulty } = req.query;

  // Formulate a cache key based on query params
  const cacheKey = `recipes_list_s_${search || ''}_c_${category || ''}_d_${difficulty || ''}`;
  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      count: cachedData.length,
      cached: true,
      data: cachedData,
    });
  }

  let query = {};

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category) {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  // Difficulty filter
  if (difficulty) {
    query.difficulty = difficulty;
  }

  const recipes = await Recipe.find(query)
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  // Store in cache for 5 minutes
  await setCache(cacheKey, recipes, 300);

  res.status(200).json({
    success: true,
    count: recipes.length,
    cached: false,
    data: recipes,
  });
});

// @desc    Get popular recipes
// @route   GET /api/recipes/popular
// @access  Public
exports.getPopularRecipes = asyncHandler(async (req, res, next) => {
  const cacheKey = 'popular_recipes';
  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      cached: true,
      data: cachedData,
    });
  }

  // Find recipes sorted by average rating and ratings count descending
  const recipes = await Recipe.find()
    .populate('user', 'name')
    .sort({ averageRating: -1, ratingsCount: -1 })
    .limit(6);

  await setCache(cacheKey, recipes, 600); // cache popular recipes for 10 minutes

  res.status(200).json({
    success: true,
    cached: false,
    data: recipes,
  });
});

// @desc    Get categories
// @route   GET /api/recipes/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const cacheKey = 'recipe_categories';
  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      cached: true,
      data: cachedData,
    });
  }

  // Distinct categories from DB
  const dbCategories = await Recipe.distinct('category');
  
  // Default list of categories to always display
  const defaultCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Vegan', 'Beverages'];
  
  // Combine and de-duplicate
  const categoriesSet = new Set([...defaultCategories, ...dbCategories]);
  const categories = Array.from(categoriesSet).filter(Boolean);

  await setCache(cacheKey, categories, 3600); // Cache categories for 1 hour

  res.status(200).json({
    success: true,
    cached: false,
    data: categories,
  });
});

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipe = asyncHandler(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id).populate('user', 'name email');

  if (!recipe) {
    res.statusCode = 404;
    throw new Error(`Recipe not found with id of ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    data: recipe,
  });
});

// @desc    Create recipe
// @route   POST /api/recipes
// @access  Private
exports.createRecipe = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const recipe = await Recipe.create(req.body);

  // Invalidate cache
  await invalidateRecipeCaches();

  // 🔴 SOCKET.IO: Notify all connected users about the new recipe
  try {
    const io = getIO();
    io.emit('new_notification', {
      type: 'new_recipe',
      message: `${req.user.name} just shared a new recipe: "${recipe.title}"!`,
      recipeId: recipe._id,
      recipeTitle: recipe.title,
      userName: req.user.name,
      category: recipe.category,
      timestamp: new Date().toISOString(),
    });
  } catch (socketErr) {
    console.warn('[Socket.IO] Could not emit new recipe event:', socketErr.message);
  }

  res.status(201).json({
    success: true,
    data: recipe,
  });
});

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private
exports.updateRecipe = asyncHandler(async (req, res, next) => {
  let recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    res.statusCode = 404;
    throw new Error(`Recipe not found with id of ${req.params.id}`);
  }

  // Make sure user is recipe owner or admin
  if (recipe.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.statusCode = 403;
    throw new Error(`User ${req.user.id} is not authorized to update this recipe`);
  }

  recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Invalidate cache
  await invalidateRecipeCaches();

  res.status(200).json({
    success: true,
    data: recipe,
  });
});

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private
exports.deleteRecipe = asyncHandler(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    res.statusCode = 404;
    throw new Error(`Recipe not found with id of ${req.params.id}`);
  }

  // Make sure user is recipe owner or admin
  if (recipe.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.statusCode = 403;
    throw new Error(`User ${req.user.id} is not authorized to delete this recipe`);
  }

  await Recipe.findByIdAndDelete(req.params.id);

  // Also delete associated reviews
  const Review = require('../models/Review');
  await Review.deleteMany({ recipe: req.params.id });

  // Invalidate cache
  await invalidateRecipeCaches();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Toggle recipe in User Favorites
// @route   POST /api/recipes/:id/favorite
// @access  Private
exports.toggleFavorite = asyncHandler(async (req, res, next) => {
  const recipeId = req.params.id;
  const user = await User.findById(req.user.id);

  if (!user) {
    res.statusCode = 404;
    throw new Error('User not found');
  }

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    res.statusCode = 404;
    throw new Error(`Recipe not found with id of ${recipeId}`);
  }

  const isFavorite = user.favorites.includes(recipeId);

  if (isFavorite) {
    // Remove from favorites
    user.favorites = user.favorites.filter((favId) => favId.toString() !== recipeId);
  } else {
    // Add to favorites
    user.favorites.push(recipeId);
  }

  await user.save();

  res.status(200).json({
    success: true,
    isFavorite: !isFavorite,
    data: user.favorites,
  });
});
