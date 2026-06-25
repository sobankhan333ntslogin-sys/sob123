const MealPlan = require('../models/MealPlan');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get user weekly meal plan
// @route   GET /api/mealplans
// @access  Private
exports.getMealPlan = asyncHandler(async (req, res, next) => {
  let mealPlan = await MealPlan.findOne({ user: req.user.id })
    .populate('meals.Monday')
    .populate('meals.Tuesday')
    .populate('meals.Wednesday')
    .populate('meals.Thursday')
    .populate('meals.Friday')
    .populate('meals.Saturday')
    .populate('meals.Sunday');

  if (!mealPlan) {
    // Create an empty layout
    mealPlan = await MealPlan.create({
      user: req.user.id,
      meals: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      },
    });
  }

  res.status(200).json({
    success: true,
    data: mealPlan,
  });
});

// @desc    Update user weekly meal plan
// @route   PUT /api/mealplans
// @access  Private
exports.updateMealPlan = asyncHandler(async (req, res, next) => {
  const { meals } = req.body;

  let mealPlan = await MealPlan.findOne({ user: req.user.id });

  if (!mealPlan) {
    mealPlan = new MealPlan({
      user: req.user.id,
      meals,
    });
  } else {
    mealPlan.meals = meals;
    mealPlan.updatedAt = Date.now();
  }

  await mealPlan.save();

  // Populate recipes
  mealPlan = await MealPlan.findById(mealPlan._id)
    .populate('meals.Monday')
    .populate('meals.Tuesday')
    .populate('meals.Wednesday')
    .populate('meals.Thursday')
    .populate('meals.Friday')
    .populate('meals.Saturday')
    .populate('meals.Sunday');

  res.status(200).json({
    success: true,
    data: mealPlan,
  });
});
