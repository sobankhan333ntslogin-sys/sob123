const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { initCache } = require('./config/cache');
const { initSocket } = require('./socket/socketManager');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize caching (Redis/Memory fallback)
initCache();

const app = express();

// Create HTTP server (required for Socket.IO)
const server = http.createServer(app);

// Initialize Socket.IO (must be done before routes)
initSocket(server);

// Body parser
app.use(express.json());

// Set security headers using Helmet
// Note: contentSecurityPolicy relaxed to allow WebSocket connections
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Route files
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api/admin', adminRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the RecipeHub API!',
    status: 'Healthy',
    timestamp: new Date(),
  });
});

// Custom Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections (log only - don't exit so DB retry works)
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
