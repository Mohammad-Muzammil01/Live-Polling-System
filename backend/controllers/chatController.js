const { logger } = require('../utils/logger');
const { ChatManager } = require('../services/chatManager');

const chatManager = new ChatManager();

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    const { userId } = req.user;

    const messages = chatManager.getChatHistory(parseInt(limit), before);
    
    res.status(200).json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error) {
    logger.error(`Error getting chat history: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat history'
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { text, recipientId } = req.body;
    const { userId, role } = req.user;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required'
      });
    }

    if (text.trim().length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Message too long. Maximum 500 characters allowed.'
      });
    }

    const messageData = {
      senderId: userId,
      senderRole: role,
      text: text.trim(),
      recipientId: recipientId || null, // null for broadcast messages
      timestamp: new Date()
    };

    const newMessage = chatManager.addMessage(messageData);

    logger.info(`Message sent by ${userId}: ${text.substring(0, 50)}...`);

    res.status(201).json({
      success: true,
      data: {
        id: newMessage.id,
        text: newMessage.text,
        senderId: newMessage.senderId,
        senderRole: newMessage.senderRole,
        timestamp: newMessage.timestamp
      },
      message: 'Message sent successfully'
    });
  } catch (error) {
    logger.error(`Error sending message: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

// Get chat participants
const getParticipants = async (req, res) => {
  try {
    const participants = chatManager.getActiveParticipants();
    
    res.status(200).json({
      success: true,
      data: participants,
      count: participants.length
    });
  } catch (error) {
    logger.error(`Error getting chat participants: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat participants'
    });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  getParticipants
};
