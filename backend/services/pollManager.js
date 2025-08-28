const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

class PollManager {
  constructor() {
    this.activePoll = null;
    this.pollHistory = [];
    this.pollTimers = new Map();
  }

  // Create a new poll
  createPoll(pollData, allStudentIds = []) {
    try {
      // Validate poll data
      if (!pollData.question || !pollData.options || pollData.options.length < 2) {
        throw new Error('Invalid poll data');
      }

      // Enforce: Only allow new poll if no poll is active or all students have answered
      if (this.activePoll && this.activePoll.isActive) {
        // If allStudentIds is provided, check if all have answered
        if (Array.isArray(allStudentIds) && allStudentIds.length > 0) {
          const notAnswered = allStudentIds.filter(id => !this.activePoll.answeredBy.includes(id));
          if (notAnswered.length > 0) {
            throw new Error('Cannot create new poll: Not all students have answered the previous poll.');
          }
        } else {
          throw new Error('Cannot create new poll: Previous poll is still active.');
        }
      }

      // Set poll properties
      const poll = {
        ...pollData,
        id: pollData.id || uuidv4(),
        createdAt: pollData.createdAt || new Date(),
        results: {},
        answeredBy: [],
        isActive: true,
        timeRemaining: pollData.timeLimit || 60
      };

      this.activePoll = poll;
      // Start timer for the poll
      this.startPollTimer(poll.id, poll.timeLimit);

      logger.info(`Poll created: ${poll.question} (ID: ${poll.id})`);
      return poll;
    } catch (error) {
      logger.error(`Error creating poll: ${error.message}`);
      throw error;
    }
  }

  // Get active poll
  getActivePoll() {
    return this.activePoll;
  }

  // Get poll history
  getPollHistory() {
    return [...this.pollHistory].reverse(); // Most recent first
  }

  // Submit answer to poll
  submitAnswer(pollId, answer, userId) {
    try {
      if (!this.activePoll || this.activePoll.id !== pollId) {
        return {
          success: false,
          error: 'No active poll found'
        };
      }

      if (!this.activePoll.isActive) {
        return {
          success: false,
          error: 'Poll is not active'
        };
      }

      // Check if user already answered
      if (this.activePoll.answeredBy.includes(userId)) {
        return {
          success: false,
          error: 'You have already answered this poll'
        };
      }

      // Validate answer
      const validOptions = this.activePoll.options.map(opt => opt.id);
      if (!validOptions.includes(answer)) {
        return {
          success: false,
          error: 'Invalid answer option'
        };
      }

      // Record the answer
      if (!this.activePoll.results[answer]) {
        this.activePoll.results[answer] = 0;
      }
      this.activePoll.results[answer]++;
      this.activePoll.answeredBy.push(userId);

      logger.info(`Answer submitted: User ${userId} selected option ${answer} for poll ${pollId}`);

      return {
        success: true,
        data: {
          pollId,
          answer,
          userId,
          results: this.activePoll.results,
          answeredBy: this.activePoll.answeredBy
        }
      };
    } catch (error) {
      logger.error(`Error submitting answer: ${error.message}`);
      return {
        success: false,
        error: 'Failed to submit answer'
      };
    }
  }

  // End a poll
  endPoll(pollId, teacherId) {
    try {
      if (!this.activePoll || this.activePoll.id !== pollId) {
        return {
          success: false,
          error: 'No active poll found'
        };
      }

      // Stop the timer
      this.stopPollTimer(pollId);

      // Mark poll as inactive
      this.activePoll.isActive = false;
      this.activePoll.endedAt = new Date();
      this.activePoll.endedBy = teacherId;

      // Move to history
      this.pollHistory.push({ ...this.activePoll });
      
      const endedPoll = { ...this.activePoll };
      this.activePoll = null;

      logger.info(`Poll ended: ${endedPoll.question} (ID: ${pollId}) by teacher ${teacherId}`);

      return {
        success: true,
        data: endedPoll
      };
    } catch (error) {
      logger.error(`Error ending poll: ${error.message}`);
      return {
        success: false,
        error: 'Failed to end poll'
      };
    }
  }

  // Get poll results (for both teacher and student)
  getPollResults(pollId) {
    try {
      // Both teacher and student can view poll results
      // Check active poll first
      if (this.activePoll && this.activePoll.id === pollId) {
        return this.activePoll;
      }

      // Check history
      const historicalPoll = this.pollHistory.find(poll => poll.id === pollId);
      if (historicalPoll) {
        return historicalPoll;
      }

      return null;
    } catch (error) {
      logger.error(`Error getting poll results: ${error.message}`);
      return null;
    }
  }

  // Start poll timer
  startPollTimer(pollId, duration) {
    try {
      // Clear existing timer if any
      this.stopPollTimer(pollId);

      const timer = setTimeout(() => {
        this.autoEndPoll(pollId);
      }, duration * 1000);

      this.pollTimers.set(pollId, timer);
      
      logger.info(`Timer started for poll ${pollId}: ${duration} seconds`);
    } catch (error) {
      logger.error(`Error starting poll timer: ${error.message}`);
    }
  }

  // Stop poll timer
  stopPollTimer(pollId) {
    try {
      const timer = this.pollTimers.get(pollId);
      if (timer) {
        clearTimeout(timer);
        this.pollTimers.delete(pollId);
        logger.info(`Timer stopped for poll ${pollId}`);
      }
    } catch (error) {
      logger.error(`Error stopping poll timer: ${error.message}`);
    }
  }

  // Auto-end poll when timer expires
  autoEndPoll(pollId) {
    try {
      if (this.activePoll && this.activePoll.id === pollId) {
        logger.info(`Auto-ending poll ${pollId} due to time expiration`);
        
        this.activePoll.isActive = false;
        this.activePoll.endedAt = new Date();
        this.activePoll.endedBy = 'system';

        // Move to history
        this.pollHistory.push({ ...this.activePoll });
        this.activePoll = null;
      }
    } catch (error) {
      logger.error(`Error auto-ending poll: ${error.message}`);
    }
  }

  // Get poll statistics
  getPollStats(pollId) {
    try {
      const poll = this.getPollResults(pollId);
      if (!poll) return null;

      const totalVotes = Object.values(poll.results || {}).reduce((sum, count) => sum + count, 0);
      const totalParticipants = poll.answeredBy.length;

      return {
        pollId,
        totalVotes,
        totalParticipants,
        results: poll.results,
        options: poll.options.map(option => ({
          ...option,
          votes: poll.results[option.id] || 0,
          percentage: totalVotes > 0 ? Math.round((poll.results[option.id] || 0) / totalVotes * 100) : 0
        }))
      };
    } catch (error) {
      logger.error(`Error getting poll stats: ${error.message}`);
      return null;
    }
  }

  // Clear all data (for testing/reset)
  clearAllData() {
    this.activePoll = null;
    this.pollHistory = [];
    this.pollTimers.forEach(timer => clearTimeout(timer));
    this.pollTimers.clear();
    logger.info('All poll data cleared');
  }
}

module.exports = { PollManager };
