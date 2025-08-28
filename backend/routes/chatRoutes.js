const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { 
  getChatHistory, 
  sendMessage,
  getParticipants
} = require('../controllers/chatController');

const router = express.Router();

// Get chat history
router.get('/history', authenticateUser, getChatHistory);

// Send a message
router.post('/message', authenticateUser, sendMessage);

// Get chat participants
router.get('/participants', authenticateUser, getParticipants);

module.exports = router;
