const express = require('express');
const { getMealPlan, updateMealPlan } = require('../controllers/mealPlanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getMealPlan)
  .put(protect, updateMealPlan);

module.exports = router;
