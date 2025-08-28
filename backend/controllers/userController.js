const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const { UserManager } = require('../services/userManager');

const userManager = new UserManager();

// Create a new user (student)
const createUser = async (req, res) => {
  try {
    const { name, role = 'student' } = req.body;

    // Validate input
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Name must be at least 2 characters long'
      });
    }

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be student or teacher'
      });
    }

    // Check if user with same name already exists
    const existingUser = userManager.getUserByName(name);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this name already exists'
      });
    }

    const userData = {
      id: uuidv4(),
      name: name.trim(),
      role,
      createdAt: new Date(),
      isActive: true
    };

    const newUser = userManager.createUser(userData);

    logger.info(`New user created: ${name} (${role})`);

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      message: 'User created successfully'
    });
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
};

// Get user information
const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userId: currentUserId, role: currentUserRole } = req.user;

    // Users can only access their own information, teachers can access any
    if (currentUserRole !== 'teacher' && currentUserId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const user = userManager.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        isActive: user.isActive
      }
    });
  } catch (error) {
    logger.error(`Error getting user: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
};

// Update user information
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userId: currentUserId, role: currentUserRole } = req.user;
    const { name } = req.body;

    // Users can only update their own information, teachers can update any
    if (currentUserRole !== 'teacher' && currentUserId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Name must be at least 2 characters long'
      });
    }

    const result = userManager.updateUser(userId, { name: name?.trim() });
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    logger.info(`User ${userId} updated by ${currentUserId}`);

    res.status(200).json({
      success: true,
      data: result.data,
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// Remove user (teacher only)
const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userId: currentUserId, role: currentUserRole } = req.user;

    if (currentUserRole !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: 'Only teachers can remove users'
      });
    }

    // Teachers cannot remove themselves
    if (currentUserId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Teachers cannot remove themselves'
      });
    }

    const result = userManager.removeUser(userId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    logger.info(`User ${userId} removed by teacher ${currentUserId}`);

    res.status(200).json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    logger.error(`Error removing user: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to remove user'
    });
  }
};

// Get all participants
const getParticipants = async (req, res) => {
  try {
    const participants = userManager.getAllActiveUsers();
    
    res.status(200).json({
      success: true,
      data: participants,
      count: participants.length
    });
  } catch (error) {
    logger.error(`Error getting participants: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get participants'
    });
  }
};

module.exports = {
  createUser,
  getUser,
  updateUser,
  removeUser,
  getParticipants
};
