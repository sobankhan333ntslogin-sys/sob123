const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    trim: true,
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent user from submitting more than one review per recipe
ReviewSchema.index({ recipe: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (recipeId) {
  const obj = await this.aggregate([
    {
      $match: { recipe: recipeId },
    },
    {
      $group: {
        _id: '$recipe',
        averageRating: { $avg: '$rating' },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Recipe').findByIdAndUpdate(recipeId, {
        averageRating: Math.round(obj[0].averageRating * 10) / 10,
        ratingsCount: obj[0].ratingsCount,
      });
    } else {
      await mongoose.model('Recipe').findByIdAndUpdate(recipeId, {
        averageRating: 0,
        ratingsCount: 0,
      });
    }
  } catch (err) {
    console.error('Error in calculating average rating:', err.message);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.recipe);
});

// Call getAverageRating after delete/remove
ReviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.getAverageRating(this.recipe);
});

// Capture delete from findOneAndDelete
ReviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.getAverageRating(doc.recipe);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
