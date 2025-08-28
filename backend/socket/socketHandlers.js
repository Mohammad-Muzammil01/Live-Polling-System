const { logger } = require('../utils/logger');
const { PollManager } = require('../services/pollManager');
const { UserManager } = require('../services/userManager');
const { ChatManager } = require('../services/chatManager');

const pollManager = new PollManager();
const userManager = new UserManager();
const chatManager = new ChatManager();

// Store connected sockets
const connectedSockets = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', (data) => {
      try {
        const { userId, role, name } = data;
        
        if (!userId || !role || !name) {
          socket.emit('auth_error', { message: 'Missing authentication data' });
          return;
        }

        // Store socket info
        connectedSockets.set(socket.id, { userId, role, name });
        socket.userId = userId;
        socket.userRole = role;
        socket.userName = name;

        // Join user to appropriate rooms
        socket.join(`user_${userId}`);
        socket.join(`role_${role}`);
        socket.join('general');

        // Mark user as online
        userManager.markUserOnline(userId);
        
        // Add to chat participants
        chatManager.addParticipant({ id: userId, name, role });

        // Emit authentication success
        socket.emit('authenticated', { 
          userId, 
          role, 
          name,
          message: 'Successfully authenticated'
        });

        // Notify others about new user
        socket.broadcast.to('general').emit('user_joined', {
          userId,
          name,
          role,
          timestamp: new Date()
        });

        // Send current active poll if any
        const activePoll = pollManager.getActivePoll();
        if (activePoll) {
          socket.emit('poll_active', activePoll);
        }

        // Send current participants
        const participants = userManager.getAllActiveUsers();
        socket.emit('participants_update', participants);

        logger.info(`User authenticated: ${name} (${role}) - Socket: ${socket.id}`);
      } catch (error) {
        logger.error(`Socket authentication error: ${error.message}`);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Handle teacher kicking a student
    socket.on('kick_user', (data) => {
      try {
        if (socket.userRole !== 'teacher') {
          socket.emit('kick_error', { message: 'Only teachers can kick users' });
          return;
        }

        const { userId } = data || {};
        if (!userId) {
          socket.emit('kick_error', { message: 'Missing userId to kick' });
          return;
        }

        const result = userManager.removeUser(userId);
        if (!result.success) {
          socket.emit('kick_error', { message: result.error || 'Failed to remove user' });
          return;
        }

        // Notify the kicked user and all others
        io.to(`user_${userId}`).emit('user_kicked', { userId, by: socket.userId, byName: socket.userName, timestamp: new Date() });
        socket.broadcast.emit('user_left', { userId, name: userManager.getUserById(userId)?.name || 'Student', timestamp: new Date() });

        // Update chat participants
        chatManager.removeParticipant(userId);

        logger.info(`User ${userId} kicked by teacher ${socket.userName}`);
      } catch (error) {
        logger.error(`Socket kick user error: ${error.message}`);
        socket.emit('kick_error', { message: 'Failed to kick user' });
      }
    });

    // Handle poll creation
    socket.on('create_poll', (pollData) => {
      try {
        if (socket.userRole !== 'teacher') {
          socket.emit('poll_error', { message: 'Only teachers can create polls' });
          return;
        }

        // Get all current student IDs
        const allStudents = userManager.getAllActiveUsers().filter(u => u.role === 'student');
        const allStudentIds = allStudents.map(u => u.id);

        // Enforce: Only allow new poll if no poll is active or all students have answered
        const newPoll = pollManager.createPoll({
          ...pollData,
          createdBy: socket.userId
        }, allStudentIds);

        // Broadcast new poll to all connected users
        io.emit('poll_created', newPoll);
        
        // Add system message
        chatManager.addSystemMessage(`New poll created: "${newPoll.question}"`);

        logger.info(`Poll created via socket by ${socket.userName}: ${newPoll.question}`);
      } catch (error) {
        logger.error(`Socket poll creation error: ${error.message}`);
        socket.emit('poll_error', { message: error.message || 'Failed to create poll' });
      }
    });

    // Handle poll answer submission
    socket.on('submit_answer', (data) => {
      try {
        const { pollId, answer } = data;
        
        if (!pollId || !answer) {
          socket.emit('answer_error', { message: 'Missing poll ID or answer' });
          return;
        }

        const result = pollManager.submitAnswer(pollId, answer, socket.userId);
        
        if (!result.success) {
          socket.emit('answer_error', { message: result.error });
          return;
        }

        // Broadcast updated results to all users
        io.emit('poll_results_updated', {
          pollId,
          results: result.data.results,
          answeredBy: result.data.answeredBy
        });

        // Add system message for first few answers
        const answeredCount = result.data.answeredBy.length;
        if (answeredCount <= 3) {
          chatManager.addSystemMessage(`${socket.userName} answered the poll`);
        }

        logger.info(`Answer submitted via socket: ${socket.userName} -> ${answer}`);
      } catch (error) {
        logger.error(`Socket answer submission error: ${error.message}`);
        socket.emit('answer_error', { message: 'Failed to submit answer' });
      }
    });

    // Handle poll ending
    socket.on('end_poll', (pollId) => {
      try {
        if (socket.userRole !== 'teacher') {
          socket.emit('poll_error', { message: 'Only teachers can end polls' });
          return;
        }

        const result = pollManager.endPoll(pollId, socket.userId);
        
        if (!result.success) {
          socket.emit('poll_error', { message: result.error });
          return;
        }

        // Broadcast poll ended to all users
        io.emit('poll_ended', result.data);
        
        // Add system message
        chatManager.addSystemMessage(`Poll ended: "${result.data.question}"`);

        logger.info(`Poll ended via socket by ${socket.userName}: ${result.data.question}`);
      } catch (error) {
        logger.error(`Socket poll ending error: ${error.message}`);
        socket.emit('poll_error', { message: 'Failed to end poll' });
      }
    });

    // Handle chat messages
    socket.on('send_message', (data) => {
      try {
        const { text, recipientId } = data;
        
        if (!text || text.trim().length === 0) {
          socket.emit('message_error', { message: 'Message cannot be empty' });
          return;
        }

        if (text.length > 500) {
          socket.emit('message_error', { message: 'Message too long' });
          return;
        }

        const messageData = {
          senderId: socket.userId,
          senderRole: socket.userRole,
          text: text.trim(),
          recipientId: recipientId || null,
          timestamp: new Date()
        };

        const newMessage = chatManager.addMessage(messageData);

        // Broadcast message
        if (recipientId) {
          // Private message
          socket.to(`user_${recipientId}`).emit('private_message', newMessage);
          socket.emit('message_sent', newMessage);
        } else {
          // Broadcast message to others, and confirm to sender separately
          socket.broadcast.emit('new_message', newMessage);
          socket.emit('message_sent', newMessage);
        }

        logger.info(`Chat message sent via socket: ${socket.userName} -> ${text.substring(0, 50)}...`);
      } catch (error) {
        logger.error(`Socket message sending error: ${error.message}`);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { recipientId } = data;
      if (recipientId) {
        socket.to(`user_${recipientId}`).emit('user_typing', {
          userId: socket.userId,
          name: socket.userName
        });
      } else {
        socket.broadcast.emit('user_typing', {
          userId: socket.userId,
          name: socket.userName
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { recipientId } = data;
      if (recipientId) {
        socket.to(`user_${recipientId}`).emit('user_stopped_typing', {
          userId: socket.userId
        });
      } else {
        socket.broadcast.emit('user_stopped_typing', {
          userId: socket.userId
        });
      }
    });

    // Handle user name updates
    socket.on('update_user_name', (data) => {
      try {
        const { name } = data;
        
        if (!name || name.trim().length === 0) {
          socket.emit('name_update_error', { message: 'Name cannot be empty' });
          return;
        }

        // Update socket user name
        socket.userName = name.trim();
        
        // Update in connected sockets
        const userInfo = connectedSockets.get(socket.id);
        if (userInfo) {
          userInfo.name = name.trim();
          connectedSockets.set(socket.id, userInfo);
        }

        // Update in user manager
        userManager.updateUser(socket.userId, { name: name.trim() });
        
        // Update in chat manager
        chatManager.updateParticipantStatus(socket.userId, { name: name.trim() });

        // Broadcast name update
        socket.broadcast.emit('user_name_updated', {
          userId: socket.userId,
          oldName: 'Student',
          newName: name.trim(),
          timestamp: new Date()
        });

        logger.info(`User name updated: ${socket.userId} -> ${name.trim()}`);
      } catch (error) {
        logger.error(`Socket name update error: ${error.message}`);
        socket.emit('name_update_error', { message: 'Failed to update name' });
      }
    });

    // Handle user status updates
    socket.on('update_status', (data) => {
      try {
        const { status, customStatus } = data;
        
        // Update user status
        userManager.updateUser(socket.userId, { status, customStatus });
        
        // Broadcast status update
        socket.broadcast.emit('user_status_updated', {
          userId: socket.userId,
          name: socket.userName,
          status,
          customStatus,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error(`Socket status update error: ${error.message}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      try {
        const userInfo = connectedSockets.get(socket.id);
        
        if (userInfo) {
          const { userId, name } = userInfo;
          
          // Mark user as offline
          userManager.markUserOffline(userId);
          
          // Remove from chat participants
          chatManager.updateParticipantStatus(userId, { isOnline: false });
          
          // Remove from connected sockets
          connectedSockets.delete(socket.id);
          
          // Notify others about user leaving
          socket.broadcast.emit('user_left', {
            userId,
            name,
            timestamp: new Date()
          });

          // Add system message
          chatManager.addSystemMessage(`${name} left the chat`);

          logger.info(`User disconnected: ${name} - Socket: ${socket.id}`);
        }
      } catch (error) {
        logger.error(`Socket disconnection error: ${error.message}`);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`);
      socket.emit('socket_error', { message: 'Socket error occurred' });
    });
  });

  // Handle server-wide events
  io.on('error', (error) => {
    logger.error(`Socket.io server error: ${error.message}`);
  });

  logger.info('Socket.io handlers configured successfully');
};

module.exports = { setupSocketHandlers };
