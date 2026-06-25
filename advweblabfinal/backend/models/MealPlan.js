const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  meals: {
    Monday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    Tuesday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    Wednesday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    Thursday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    Friday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    Saturday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    Sunday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);
