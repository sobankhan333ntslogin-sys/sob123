const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');
const MealPlan = require('../models/MealPlan');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res, next) => {
  const usersCount = await User.countDocuments();
  const recipesCount = await Recipe.countDocuments();
  const reviewsCount = await Review.countDocuments();
  const categories = await Recipe.distinct('category');

  res.status(200).json({
    success: true,
    data: {
      users: usersCount,
      recipes: recipesCount,
      reviews: reviewsCount,
      categories: categories.length,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: users,
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.statusCode = 404;
    throw new Error('User not found');
  }

  // Prevent deleting oneself
  if (user._id.toString() === req.user.id) {
    res.statusCode = 400;
    throw new Error('You cannot delete your own admin account');
  }

  // Delete associated recipes
  await Recipe.deleteMany({ user: req.params.id });

  // Delete associated reviews
  await Review.deleteMany({ user: req.params.id });

  // Delete associated meal plan
  await MealPlan.deleteMany({ user: req.params.id });

  // Delete the user
  await User.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {},
  });
});
