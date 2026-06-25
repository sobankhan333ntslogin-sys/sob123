/**
 * socketManager.js
 * Manages all Socket.IO real-time events for RecipeHub.
 * Tracks online users, broadcasts notifications and live reviews.
 */

let io;

// Track online users: { socketId -> { userId, name } }
const onlineUsers = new Map();

const initSocket = (httpServer) => {
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Use websocket first, fallback to polling
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // -------------------------------------------------
    // USER IDENTIFIES THEMSELVES AFTER LOGIN
    // -------------------------------------------------
    socket.on('user_connected', ({ userId, name }) => {
      onlineUsers.set(socket.id, { userId, name });
      console.log(`[Socket.IO] ${name} (${userId}) is now online. Total online: ${onlineUsers.size}`);
      // Broadcast updated count to ALL clients
      io.emit('user_count', onlineUsers.size);
    });

    // -------------------------------------------------
    // JOIN A SPECIFIC RECIPE ROOM (for live reviews)
    // -------------------------------------------------
    socket.on('join_recipe_room', (recipeId) => {
      socket.join(`recipe:${recipeId}`);
      console.log(`[Socket.IO] ${socket.id} joined room recipe:${recipeId}`);
    });

    // -------------------------------------------------
    // LEAVE A SPECIFIC RECIPE ROOM
    // -------------------------------------------------
    socket.on('leave_recipe_room', (recipeId) => {
      socket.leave(`recipe:${recipeId}`);
    });

    // -------------------------------------------------
    // DISCONNECT — clean up and update count
    // -------------------------------------------------
    socket.on('disconnect', () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        console.log(`[Socket.IO] ${user.name} disconnected. Total online: ${onlineUsers.size - 1}`);
      }
      onlineUsers.delete(socket.id);
      io.emit('user_count', onlineUsers.size);
    });
  });

  console.log('[Socket.IO] Server initialized');
  return io;
};

/**
 * Get the Socket.IO instance (call after initSocket)
 */
const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocket() first.');
  return io;
};

module.exports = { initSocket, getIO };
