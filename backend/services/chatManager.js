const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

class ChatManager {
  constructor() {
    this.messages = [];
    this.participants = new Map();
    this.maxMessages = 1000; // Keep last 1000 messages
  }

  // Add a new message
  addMessage(messageData) {
    try {
      // Validate message data
      if (!messageData.text || !messageData.senderId) {
        throw new Error('Message text and sender ID are required');
      }

      // Create message object
      const message = {
        id: uuidv4(),
        text: messageData.text,
        senderId: messageData.senderId,
        senderRole: messageData.senderRole || 'student',
        recipientId: messageData.recipientId || null,
        timestamp: messageData.timestamp || new Date(),
        isSystem: messageData.isSystem || false
      };

      // Add to messages array
      this.messages.push(message);

      // Maintain message limit
      if (this.messages.length > this.maxMessages) {
        this.messages = this.messages.slice(-this.maxMessages);
      }

      logger.info(`Chat message added: ${message.senderId} -> ${message.text.substring(0, 50)}...`);
      
      return message;
    } catch (error) {
      logger.error(`Error adding message: ${error.message}`);
      throw error;
    }
  }

  // Get chat history
  getChatHistory(limit = 50, before = null) {
    try {
      let filteredMessages = [...this.messages];

      // Filter by timestamp if 'before' is provided
      if (before) {
        const beforeDate = new Date(before);
        filteredMessages = filteredMessages.filter(msg => msg.timestamp < beforeDate);
      }

      // Sort by timestamp (newest first) and limit results
      const sortedMessages = filteredMessages
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

      // Return in chronological order (oldest first)
      return sortedMessages.reverse();
    } catch (error) {
      logger.error(`Error getting chat history: ${error.message}`);
      return [];
    }
  }

  // Get messages by sender
  getMessagesBySender(senderId, limit = 20) {
    try {
      const senderMessages = this.messages
        .filter(msg => msg.senderId === senderId)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

      return senderMessages.reverse();
    } catch (error) {
      logger.error(`Error getting messages by sender: ${error.message}`);
      return [];
    }
  }

  // Get private messages between two users
  getPrivateMessages(userId1, userId2, limit = 50) {
    try {
      const privateMessages = this.messages
        .filter(msg => 
          (msg.senderId === userId1 && msg.recipientId === userId2) ||
          (msg.senderId === userId2 && msg.recipientId === userId1)
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

      return privateMessages.reverse();
    } catch (error) {
      logger.error(`Error getting private messages: ${error.message}`);
      return [];
    }
  }

  // Add participant
  addParticipant(participantData) {
    try {
      if (!participantData.id || !participantData.name) {
        throw new Error('Participant ID and name are required');
      }

      const participant = {
        id: participantData.id,
        name: participantData.name,
        role: participantData.role || 'student',
        joinedAt: participantData.joinedAt || new Date(),
        lastSeen: new Date(),
        isOnline: true
      };

      this.participants.set(participant.id, participant);

      logger.info(`Chat participant added: ${participant.name} (${participant.role})`);
      
      return participant;
    } catch (error) {
      logger.error(`Error adding participant: ${error.message}`);
      throw error;
    }
  }

  // Remove participant
  removeParticipant(participantId) {
    try {
      const participant = this.participants.get(participantId);
      if (participant) {
        this.participants.delete(participantId);
        logger.info(`Chat participant removed: ${participant.name}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error removing participant: ${error.message}`);
      return false;
    }
  }

  // Update participant status
  updateParticipantStatus(participantId, updates) {
    try {
      const participant = this.participants.get(participantId);
      if (!participant) {
        return false;
      }

      // Apply updates
      if (updates.isOnline !== undefined) {
        participant.isOnline = updates.isOnline;
      }

      if (updates.lastSeen !== undefined) {
        participant.lastSeen = updates.lastSeen;
      }

      if (updates.name !== undefined) {
        participant.name = updates.name;
      }

      if (updates.role !== undefined) {
        participant.role = updates.role;
      }

      logger.debug(`Participant ${participantId} status updated`);
      return true;
    } catch (error) {
      logger.error(`Error updating participant status: ${error.message}`);
      return false;
    }
  }

  // Get active participants
  getActiveParticipants() {
    try {
      const activeParticipants = [];
      for (const participant of this.participants.values()) {
        if (participant.isOnline) {
          activeParticipants.push({
            id: participant.id,
            name: participant.name,
            role: participant.role,
            joinedAt: participant.joinedAt,
            lastSeen: participant.lastSeen
          });
        }
      }

      // Sort by last seen (most recent first)
      return activeParticipants.sort((a, b) => b.lastSeen - a.lastSeen);
    } catch (error) {
      logger.error(`Error getting active participants: ${error.message}`);
      return [];
    }
  }

  // Get all participants
  getAllParticipants() {
    try {
      const allParticipants = [];
      for (const participant of this.participants.values()) {
        allParticipants.push({
          id: participant.id,
          name: participant.name,
          role: participant.role,
          joinedAt: participant.joinedAt,
          lastSeen: participant.lastSeen,
          isOnline: participant.isOnline
        });
      }

      return allParticipants.sort((a, b) => b.lastSeen - a.lastSeen);
    } catch (error) {
      logger.error(`Error getting all participants: ${error.message}`);
      return [];
    }
  }

  // Add system message
  addSystemMessage(text) {
    try {
      const systemMessage = {
        id: uuidv4(),
        text,
        senderId: 'system',
        senderRole: 'system',
        recipientId: null,
        timestamp: new Date(),
        isSystem: true
      };

      this.messages.push(systemMessage);

      // Maintain message limit
      if (this.messages.length > this.maxMessages) {
        this.messages = this.messages.slice(-this.maxMessages);
      }

      logger.info(`System message added: ${text}`);
      
      return systemMessage;
    } catch (error) {
      logger.error(`Error adding system message: ${error.message}`);
      throw error;
    }
  }

  // Search messages
  searchMessages(query, limit = 20) {
    try {
      const searchTerm = query.toLowerCase();
      const results = [];

      for (const message of this.messages) {
        if (message.text.toLowerCase().includes(searchTerm)) {
          results.push(message);
          if (results.length >= limit) break;
        }
      }

      return results.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      logger.error(`Error searching messages: ${error.message}`);
      return [];
    }
  }

  // Get chat statistics
  getChatStats() {
    try {
      const totalMessages = this.messages.length;
      const totalParticipants = this.participants.size;
      const activeParticipants = this.getActiveParticipants().length;
      const systemMessages = this.messages.filter(msg => msg.isSystem).length;
      const privateMessages = this.messages.filter(msg => msg.recipientId !== null).length;

      return {
        totalMessages,
        totalParticipants,
        activeParticipants,
        systemMessages,
        privateMessages,
        broadcastMessages: totalMessages - systemMessages - privateMessages
      };
    } catch (error) {
      logger.error(`Error getting chat stats: ${error.message}`);
      return null;
    }
  }

  // Clear all data (for testing/reset)
  clearAllData() {
    this.messages = [];
    this.participants.clear();
    logger.info('All chat data cleared');
  }
}

module.exports = { ChatManager };
