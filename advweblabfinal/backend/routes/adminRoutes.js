const express = require('express');
const { getStats, getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect and authorize('admin') to all routes in this router
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.route('/users').get(getAllUsers);
router.route('/users/:id').delete(deleteUser);

module.exports = router;
