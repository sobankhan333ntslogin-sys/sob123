const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    res.statusCode = 401;
    throw new Error('Not authorized to access this route. No token provided.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforrecipehubjwt12345');

    // Get user from the token and attach to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.statusCode = 401;
      throw new Error('The user belonging to this token no longer exists.');
    }

    next();
  } catch (err) {
    res.statusCode = 401;
    throw new Error('Not authorized, token validation failed');
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.statusCode = 401;
      throw new Error('User not authenticated');
    }
    if (!roles.includes(req.user.role)) {
      res.statusCode = 403;
      throw new Error(`User role '${req.user.role}' is not authorized to access this route`);
    }
    next();
  };
};

module.exports = { protect, authorize };
