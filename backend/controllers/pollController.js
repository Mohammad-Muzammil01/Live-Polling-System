const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const { PollManager } = require('../services/pollManager');

const pollManager = new PollManager();

// Create a new poll
const createPoll = async (req, res) => {
  try {
    const { question, options, timeLimit } = req.body;
    const { userId } = req.user;

    // Validate input
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Question and at least 2 options are required'
      });
    }

    if (timeLimit && (timeLimit < 30 || timeLimit > 300)) {
      return res.status(400).json({
        success: false,
        error: 'Time limit must be between 30 and 300 seconds'
      });
    }

    // Check if there's already an active poll
    const activePoll = pollManager.getActivePoll();
    if (activePoll) {
      return res.status(400).json({
        success: false,
        error: 'There is already an active poll. Please end it first.'
      });
    }

    const pollData = {
      id: uuidv4(),
      question,
      options: options.map((opt, index) => ({
        id: index + 1,
        text: opt.text,
        isCorrect: opt.isCorrect || false
      })),
      timeLimit: timeLimit || 60,
      createdBy: userId,
      createdAt: new Date(),
      results: {},
      answeredBy: [],
      isActive: true
    };

    const newPoll = pollManager.createPoll(pollData);

    logger.info(`New poll created by teacher ${userId}: ${question}`);

    res.status(201).json({
      success: true,
      data: newPoll,
      message: 'Poll created successfully'
    });
  } catch (error) {
    logger.error(`Error creating poll: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to create poll'
    });
  }
};

// Get active poll
const getActivePoll = async (req, res) => {
  try {
    const activePoll = pollManager.getActivePoll();
    
    if (!activePoll) {
      return res.status(404).json({
        success: false,
        error: 'No active poll found'
      });
    }

    res.status(200).json({
      success: true,
      data: activePoll
    });
  } catch (error) {
    logger.error(`Error getting active poll: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get active poll'
    });
  }
};

// Get poll history
const getPollHistory = async (req, res) => {
  try {
    const history = pollManager.getPollHistory();
    
    res.status(200).json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    logger.error(`Error getting poll history: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get poll history'
    });
  }
};

// Submit answer to poll
const submitAnswer = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { answer } = req.body;
    const { userId } = req.user;

    if (!answer) {
      return res.status(400).json({
        success: false,
        error: 'Answer is required'
      });
    }

    const result = pollManager.submitAnswer(pollId, answer, userId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    logger.info(`Answer submitted by student ${userId} for poll ${pollId}`);

    res.status(200).json({
      success: true,
      data: result.data,
      message: 'Answer submitted successfully'
    });
  } catch (error) {
    logger.error(`Error submitting answer: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to submit answer'
    });
  }
};

// End a poll
const endPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { userId } = req.user;

    const result = pollManager.endPoll(pollId, userId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    logger.info(`Poll ${pollId} ended by teacher ${userId}`);

    res.status(200).json({
      success: true,
      data: result.data,
      message: 'Poll ended successfully'
    });
  } catch (error) {
    logger.error(`Error ending poll: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to end poll'
    });
  }
};

// Get poll results
const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    
    const results = pollManager.getPollResults(pollId);
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found'
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error(`Error getting poll results: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get poll results'
    });
  }
};

module.exports = {
  createPoll,
  getActivePoll,
  getPollHistory,
  submitAnswer,
  endPoll,
  getPollResults
};
