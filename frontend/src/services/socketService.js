import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId, role, name) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // Connect to your backend server
    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      
      // Authenticate the user with the server
      console.log('Authenticating with:', { userId, role, name });
      this.socket.emit('authenticate', { userId, role, name });
    });

    this.socket.on('authenticated', (data) => {
      console.log('Authentication successful:', data);
      this.isConnected = true;
      
      // Emit a custom event to notify that authentication is complete
      this.socket.emit('auth_complete');
    });

    this.socket.on('auth_error', (error) => {
      console.error('Authentication failed:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Poll-related events
  onPollCreated(callback) {
    if (this.socket) {
      console.log('Setting up poll_created listener');
      this.socket.on('poll_created', (data) => {
        console.log('Received poll_created event:', data);
        callback(data);
      });
    } else {
      console.error('Socket not connected when trying to set up poll_created listener');
    }
  }

  // Receive currently active poll when (re)connecting
  onPollActive(callback) {
    if (this.socket) {
      this.socket.on('poll_active', callback);
    }
  }
  onPollEnded(callback) {
    if (this.socket) {
      this.socket.on('poll_ended', callback);
    }
  }

  onAnswerSubmitted(callback) {
    if (this.socket) {
      // Backend emits 'poll_results_updated' for answers; support both for safety
      this.socket.on('poll_results_updated', callback);
      this.socket.on('answer_submitted', callback);
    }
  }

  // Chat-related events
  onMessageReceived(callback) {
    if (this.socket) {
      // Backend emits 'new_message' and 'private_message'
      this.socket.on('new_message', callback);
      this.socket.on('private_message', callback);
    }
  }

  // Echo for sender so UI only adds once
  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message_sent', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
    }
  }

  // User status events
  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }

  // Participants list updates
  onParticipantsUpdate(callback) {
    if (this.socket) {
      this.socket.on('participants_update', callback);
    }
  }

  // Kick related
  onUserKicked(callback) {
    if (this.socket) {
      this.socket.on('user_kicked', callback);
    }
  }

  kickUser(userId) {
    if (this.socket) {
      this.socket.emit('kick_user', { userId });
    }
  }

  // Emit events
  createPoll(pollData) {
    if (this.socket) {
      console.log('Emitting create_poll event:', pollData);
      this.socket.emit('create_poll', pollData);
    } else {
      console.error('Socket not connected when trying to create poll');
    }
  }

  submitAnswer(answerData) {
    if (this.socket) {
      this.socket.emit('submit_answer', answerData);
    }
  }

  endPoll(pollId) {
    if (this.socket) {
      this.socket.emit('end_poll', { pollId });
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('send_message', messageData);
    }
  }

  startTyping() {
    if (this.socket) {
      this.socket.emit('typing_start');
    }
  }

  stopTyping() {
    if (this.socket) {
      this.socket.emit('typing_stop');
    }
  }

  // Remove event listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Wait for authentication to complete
  waitForAuth(callback) {
    if (this.socket) {
      this.socket.on('auth_complete', callback);
    }
  }

  // Update user name (useful for students who enter their name after connecting)
  updateUserName(newName) {
    if (this.socket) {
      console.log('Updating user name to:', newName);
      this.socket.emit('update_user_name', { name: newName });
    }
  }
}

// Export a singleton instance
export default new SocketService();
