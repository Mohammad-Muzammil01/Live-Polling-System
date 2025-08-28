const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { 
  createUser, 
  getUser, 
  updateUser, 
  removeUser,
  getParticipants
} = require('../controllers/userController');

const router = express.Router();

// Create a new user (student)
router.post('/', createUser);

// Get user information
router.get('/:userId', authenticateUser, getUser);

// Update user information
router.put('/:userId', authenticateUser, updateUser);

// Remove user (teacher only)
router.delete('/:userId', authenticateUser, removeUser);

// Get all participants
router.get('/participants/all', getParticipants);

module.exports = router;
