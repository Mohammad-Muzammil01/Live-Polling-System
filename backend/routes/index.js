const express = require('express');
const pollRoutes = require('./pollRoutes');
const userRoutes = require('./userRoutes');
const chatRoutes = require('./chatRoutes');

const setupRoutes = (app) => {
  // API routes
  app.use('/api/polls', pollRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/chat', chatRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Live Polling System API',
      version: '1.0.0',
      endpoints: {
        polls: '/api/polls',
        users: '/api/users',
        chat: '/api/chat',
        health: '/health'
      },
      documentation: 'API documentation coming soon'
    });
  });
};

module.exports = { setupRoutes };
