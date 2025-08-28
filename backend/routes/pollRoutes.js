const express = require('express');
const { authenticateUser, requireTeacher } = require('../middleware/auth');
const { 
  createPoll, 
  getActivePoll, 
  getPollHistory, 
  submitAnswer,
  endPoll,
  getPollResults
} = require('../controllers/pollController');

const router = express.Router();

// Create a new poll (teacher only)
router.post('/', authenticateUser, requireTeacher, createPoll);

// Get active poll
router.get('/active', getActivePoll);

// Get poll history (teacher only)
router.get('/history', authenticateUser, requireTeacher, getPollHistory);

// Submit answer to poll (student only)
router.post('/:pollId/answer', authenticateUser, submitAnswer);

// End a poll (teacher only)
router.put('/:pollId/end', authenticateUser, requireTeacher, endPoll);

// Get poll results
router.get('/:pollId/results', getPollResults);

module.exports = router;
