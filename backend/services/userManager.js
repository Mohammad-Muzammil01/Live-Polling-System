const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

class UserManager {
  constructor() {
    this.users = new Map();
    this.activeUsers = new Set();
  }

  // Create a new user
  createUser(userData) {
    try {
      // Validate user data
      if (!userData.name || !userData.role) {
        throw new Error('Name and role are required');
      }

      // Check for duplicate names
      if (this.getUserByName(userData.name)) {
        throw new Error('User with this name already exists');
      }

      // Create user object
      const user = {
        id: userData.id || uuidv4(),
        name: userData.name.trim(),
        role: userData.role,
        createdAt: userData.createdAt || new Date(),
        isActive: true,
        lastSeen: new Date()
      };

      // Store user
      this.users.set(user.id, user);
      this.activeUsers.add(user.id);

      logger.info(`User created: ${user.name} (${user.role}) with ID ${user.id}`);
      
      return user;
    } catch (error) {
      logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  // Get user by ID
  getUserById(userId) {
    return this.users.get(userId) || null;
  }

  // Get user by name
  getUserByName(name) {
    for (const user of this.users.values()) {
      if (user.name.toLowerCase() === name.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  // Get all active users
  getAllActiveUsers() {
    const activeUsers = [];
    for (const userId of this.activeUsers) {
      const user = this.users.get(userId);
      if (user && user.isActive) {
        activeUsers.push({
          id: user.id,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          lastSeen: user.lastSeen
        });
      }
    }
    return activeUsers;
  }

  // Get users by role
  getUsersByRole(role) {
    const roleUsers = [];
    for (const user of this.users.values()) {
      if (user.role === role && user.isActive) {
        roleUsers.push({
          id: user.id,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          lastSeen: user.lastSeen
        });
      }
    }
    return roleUsers;
  }

  // Update user
  updateUser(userId, updates) {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Apply updates
      if (updates.name !== undefined) {
        // Check for duplicate names
        const existingUser = this.getUserByName(updates.name);
        if (existingUser && existingUser.id !== userId) {
          return {
            success: false,
            error: 'User with this name already exists'
          };
        }
        user.name = updates.name;
      }

      if (updates.role !== undefined) {
        user.role = updates.role;
      }

      if (updates.isActive !== undefined) {
        user.isActive = updates.isActive;
        if (user.isActive) {
          this.activeUsers.add(userId);
        } else {
          this.activeUsers.delete(userId);
        }
      }

      user.lastSeen = new Date();

      logger.info(`User ${userId} updated`);

      return {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          lastSeen: user.lastSeen,
          isActive: user.isActive
        }
      };
    } catch (error) {
      logger.error(`Error updating user: ${error.message}`);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }

  // Remove user
  removeUser(userId) {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Mark as inactive and remove from active users
      user.isActive = false;
      this.activeUsers.delete(userId);

      logger.info(`User ${userId} (${user.name}) removed`);

      return {
        success: true,
        message: 'User removed successfully'
      };
    } catch (error) {
      logger.error(`Error removing user: ${error.message}`);
      return {
        success: false,
        error: 'Failed to remove user'
      };
    }
  }

  // Mark user as online
  markUserOnline(userId) {
    try {
      const user = this.users.get(userId);
      if (user) {
        user.lastSeen = new Date();
        if (user.isActive) {
          this.activeUsers.add(userId);
        }
        logger.debug(`User ${userId} marked as online`);
      }
    } catch (error) {
      logger.error(`Error marking user online: ${error.message}`);
    }
  }

  // Mark user as offline
  markUserOffline(userId) {
    try {
      this.activeUsers.delete(userId);
      logger.debug(`User ${userId} marked as offline`);
    } catch (error) {
      logger.error(`Error marking user offline: ${error.message}`);
    }
  }

  // Get user statistics
  getUserStats() {
    try {
      const totalUsers = this.users.size;
      const activeUsers = this.activeUsers.size;
      const teachers = this.getUsersByRole('teacher').length;
      const students = this.getUsersByRole('student').length;

      return {
        totalUsers,
        activeUsers,
        teachers,
        students,
        offlineUsers: totalUsers - activeUsers
      };
    } catch (error) {
      logger.error(`Error getting user stats: ${error.message}`);
      return null;
    }
  }

  // Search users
  searchUsers(query, limit = 10) {
    try {
      const results = [];
      const searchTerm = query.toLowerCase();

      for (const user of this.users.values()) {
        if (user.isActive && user.name.toLowerCase().includes(searchTerm)) {
          results.push({
            id: user.id,
            name: user.name,
            role: user.role
          });

          if (results.length >= limit) break;
        }
      }

      return results;
    } catch (error) {
      logger.error(`Error searching users: ${error.message}`);
      return [];
    }
  }

  // Clear all data (for testing/reset)
  clearAllData() {
    this.users.clear();
    this.activeUsers.clear();
    logger.info('All user data cleared');
  }
}

module.exports = { UserManager };
