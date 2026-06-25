const express = require('express');
const {
  getRecipes,
  getPopularRecipes,
  getCategories,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/popular', getPopularRecipes);
router.get('/categories', getCategories);

router
  .route('/')
  .get(getRecipes)
  .post(protect, createRecipe);

router
  .route('/:id')
  .get(getRecipe)
  .put(protect, updateRecipe)
  .delete(protect, deleteRecipe);

router.post('/:id/favorite', protect, toggleFavorite);

module.exports = router;
