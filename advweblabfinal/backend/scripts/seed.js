const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');
const MealPlan = require('../models/MealPlan');

dotenv.config();

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@recipehub.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Jane Doe',
    email: 'jane@recipehub.com',
    password: 'password123',
    role: 'user',
  },
];

const recipesData = [
  {
    title: 'Fluffy Blueberry Pancakes',
    description: 'A classic breakfast recipe for thick, fluffy pancakes packed with sweet fresh blueberries.',
    ingredients: [
      '2 cups all-purpose flour',
      '2 tsp baking powder',
      '1/2 tsp baking soda',
      '2 tbsp sugar',
      '1/2 tsp salt',
      '2 eggs',
      '1.5 cups milk',
      '1/4 cup melted butter',
      '1 cup fresh blueberries',
    ],
    instructions: [
      'Whisk dry ingredients together in a large bowl.',
      'In another bowl, whisk eggs, milk, and melted butter.',
      'Pour wet ingredients into dry and stir gently (do not overmix).',
      'Fold in blueberries.',
      'Heat a greased griddle over medium heat and pour batter in circles.',
      'Flip when bubbles appear on top, cook until golden brown.',
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: 'Easy',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Spaghetti Carbonara',
    description: 'Authentic Roman pasta dish made with eggs, hard cheese, cured pork, and black pepper.',
    ingredients: [
      '400g spaghetti',
      '150g guanciale or pancetta, diced',
      '4 large eggs',
      '75g Pecorino Romano cheese, grated',
      'Freshly cracked black pepper',
      'Salt',
    ],
    instructions: [
      'Boil spaghetti in salted water until al dente.',
      'Meanwhile, fry guanciale in a skillet until crisp.',
      'Whisk eggs and Pecorino Romano together in a bowl with plenty of black pepper.',
      'Drain pasta, reserving some cooking water, and immediately toss with guanciale.',
      'Remove pan from heat, pour in egg cheese mixture, and toss vigorously to form a creamy sauce (adding pasta water if needed).',
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 3,
    difficulty: 'Medium',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Classic Avocado Toast',
    description: 'Creamy avocado on crisp sourdough bread topped with red pepper flakes and a drizzle of olive oil.',
    ingredients: [
      '2 slices sourdough bread',
      '1 ripe avocado',
      '1 tbsp lemon juice',
      'Salt and black pepper to taste',
      'Red pepper flakes',
      'Extra virgin olive oil',
    ],
    instructions: [
      'Toast the sourdough bread slices until golden brown and crisp.',
      'In a bowl, mash the avocado with lemon juice, salt, and black pepper.',
      'Spread the mashed avocado evenly over the toasted bread slices.',
      'Sprinkle with red pepper flakes and drizzle with olive oil before serving.',
    ],
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    difficulty: 'Easy',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Vegan Quinoa Salad Bowl',
    description: 'A nutritious, colorful salad packed with protein, fresh veggies, and a tangy lemon vinaigrette.',
    ingredients: [
      '1 cup uncooked quinoa',
      '1 can chickpeas, drained and rinsed',
      '1 cucumber, diced',
      '1 cup cherry tomatoes, halved',
      '1/2 red onion, finely chopped',
      '1/4 cup olive oil',
      '3 tbsp lemon juice',
      'Fresh parsley',
    ],
    instructions: [
      'Rinse and cook quinoa according to package instructions, then let cool.',
      'In a large bowl, combine cooled quinoa, chickpeas, cucumber, cherry tomatoes, and red onion.',
      'Whisk olive oil, lemon juice, salt, and pepper in a small bowl.',
      'Drizzle dressing over the salad and toss well. Garnish with chopped fresh parsley.',
    ],
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: 'Easy',
    category: 'Vegan',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Chocolate Lava Cake',
    description: 'Decadent chocolate cakes with a rich, molten chocolate center that flows out when cut.',
    ingredients: [
      '100g dark chocolate',
      '100g butter',
      '2 eggs + 2 egg yolks',
      '50g sugar',
      '50g all-purpose flour',
      'Pinch of salt',
    ],
    instructions: [
      'Preheat oven to 200C and grease ramekins with butter and cocoa powder.',
      'Melt dark chocolate and butter together in a bowl.',
      'Whisk eggs, egg yolks, sugar, and salt until thick and pale.',
      'Fold in melted chocolate mixture and sifted flour.',
      'Divide batter into ramekins and bake for 10-12 minutes until edges are firm but center is soft.',
      'Let cool for 1 minute, invert onto plates and serve immediately.',
    ],
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    difficulty: 'Hard',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recipehub');
    console.log('MongoDB Connected for Seeding...');

    // Clear DB
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});
    await MealPlan.deleteMany({});
    console.log('Existing DB collections cleared.');

    // Seed Users
    const users = await User.create(usersData);
    console.log('Users seeded successfully:', users.map((u) => u.email));

    // Assign owner to recipes
    const adminUser = users[0];
    const normalUser = users[1];

    const recipesToSeed = recipesData.map((recipe, index) => {
      return {
        ...recipe,
        user: index % 2 === 0 ? adminUser._id : normalUser._id,
      };
    });

    const recipes = await Recipe.create(recipesToSeed);
    console.log('Recipes seeded successfully:', recipes.map((r) => r.title));

    // Add some reviews
    const reviewsData = [
      {
        rating: 5,
        comment: 'Absolutely amazing! Best recipe I have ever tried.',
        recipe: recipes[0]._id,
        user: normalUser._id,
      },
      {
        rating: 4,
        comment: 'Really delicious, but I added a bit more cheese to the sauce.',
        recipe: recipes[1]._id,
        user: adminUser._id,
      },
      {
        rating: 5,
        comment: 'So simple and yet so perfect. Sourdough is key!',
        recipe: recipes[2]._id,
        user: normalUser._id,
      },
      {
        rating: 4,
        comment: 'Fresh, healthy, and super delicious. Perfect for lunch prep.',
        recipe: recipes[3]._id,
        user: adminUser._id,
      },
    ];

    for (const review of reviewsData) {
      await Review.create(review);
    }
    console.log('Reviews seeded and average ratings aggregated.');

    // Create a meal plan for normalUser
    await MealPlan.create({
      user: normalUser._id,
      meals: {
        Monday: [recipes[0]._id],
        Tuesday: [recipes[1]._id],
        Wednesday: [],
        Thursday: [recipes[2]._id],
        Friday: [],
        Saturday: [recipes[3]._id],
        Sunday: [recipes[4]._id],
      },
    });
    console.log('Default meal plan seeded.');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err.message);
    process.exit(1);
  }
};

seedDB();
