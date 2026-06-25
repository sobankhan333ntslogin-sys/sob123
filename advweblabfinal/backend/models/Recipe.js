const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a recipe title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  ingredients: {
    type: [String],
    required: [true, 'Please add at least one ingredient'],
  },
  instructions: {
    type: [String],
    required: [true, 'Please add cooking instructions'],
  },
  prepTime: {
    type: Number,
    required: [true, 'Please add preparation time in minutes'],
  },
  cookTime: {
    type: Number,
    required: [true, 'Please add cooking time in minutes'],
  },
  servings: {
    type: Number,
    required: [true, 'Please add servings count'],
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    index: true,
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5'],
  },
  ratingsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create text index for search
RecipeSchema.index({ title: 'text', description: 'text', ingredients: 'text' });

module.exports = mongoose.model('Recipe', RecipeSchema);
