const express = require('express');
const { getReviews, addReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/recipe/:recipeId')
  .get(getReviews)
  .post(protect, addReview);

router.delete('/:id', protect, deleteReview);

module.exports = router;
