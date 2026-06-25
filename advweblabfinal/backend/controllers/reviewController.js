const Review = require('../models/Review');
const Recipe = require('../models/Recipe');
const asyncHandler = require('../middleware/asyncHandler');
const { clearCache } = require('../config/cache');
const { getIO } = require('../socket/socketManager');

// @desc    Get reviews for a recipe
// @route   GET /api/reviews/recipe/:recipeId
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ recipe: req.params.recipeId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Add review
// @route   POST /api/reviews/recipe/:recipeId
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.recipe = req.params.recipeId;
  req.body.user = req.user.id;

  const recipe = await Recipe.findById(req.params.recipeId);

  if (!recipe) {
    res.statusCode = 404;
    throw new Error(`No recipe found with id of ${req.params.recipeId}`);
  }

  // Check if user has already reviewed this recipe
  const alreadyReviewed = await Review.findOne({
    recipe: req.params.recipeId,
    user: req.user.id,
  });

  if (alreadyReviewed) {
    res.statusCode = 400;
    throw new Error('You have already reviewed this recipe');
  }

  const review = await Review.create(req.body);

  // Populate user info for the socket event
  const populatedReview = await Review.findById(review._id).populate('user', 'name');

  // Clear cache since recipe rating updated
  await clearCache();

  // 🔴 SOCKET.IO: Emit real-time events
  try {
    const io = getIO();
    const recipeId = req.params.recipeId;

    // 1. Broadcast to users in the specific recipe room (live review feed)
    io.to(`recipe:${recipeId}`).emit('review_posted', {
      review: populatedReview,
      recipeId,
    });

    // 2. Broadcast a notification to ALL connected clients
    io.emit('new_notification', {
      type: 'new_review',
      message: `${req.user.name} just reviewed "${recipe.title}"`,
      rating: req.body.rating,
      recipeId,
      recipeTitle: recipe.title,
      userName: req.user.name,
      timestamp: new Date().toISOString(),
    });
  } catch (socketErr) {
    console.warn('[Socket.IO] Could not emit review event:', socketErr.message);
  }

  res.status(201).json({
    success: true,
    data: populatedReview,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.statusCode = 404;
    throw new Error(`Review not found with id of ${req.params.id}`);
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.statusCode = 403;
    throw new Error(`User is not authorized to delete this review`);
  }

  await Review.deleteOne({ _id: req.params.id });

  // Clear cache since recipe rating updated
  await clearCache();

  // 🔴 SOCKET.IO: Notify recipe room that a review was deleted
  try {
    const io = getIO();
    io.to(`recipe:${review.recipe}`).emit('review_deleted', {
      reviewId: req.params.id,
      recipeId: review.recipe,
    });
  } catch (socketErr) {
    console.warn('[Socket.IO] Could not emit delete event:', socketErr.message);
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});
