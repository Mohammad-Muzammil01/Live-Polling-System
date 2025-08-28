# Live Polling System - Backend

A robust backend server for the Live Polling System built with Express.js and Socket.io, providing real-time polling functionality, user management, and chat features.

## Features

### 🎯 **Core Functionality**
- **Real-time Polling**: Create, manage, and participate in live polls
- **User Management**: Handle teachers and students with role-based access
- **Live Chat**: Real-time communication between participants
- **Socket.io Integration**: WebSocket support for instant updates
- **RESTful API**: Comprehensive HTTP endpoints for all operations

### 🔒 **Security & Performance**
- **Rate Limiting**: Protect against abuse and DDoS attacks
- **CORS Configuration**: Secure cross-origin resource sharing
- **Helmet Security**: HTTP security headers
- **Compression**: Gzip compression for better performance
- **Request Validation**: Input validation and sanitization

### 📊 **Real-time Features**
- **Live Poll Results**: Instant updates as students answer
- **Participant Tracking**: Monitor who's online and participating
- **Chat Broadcasting**: Public and private messaging
- **Status Updates**: Real-time user presence indicators
- **Typing Indicators**: Show when users are typing

## Technology Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js 4.18.2
- **Real-time**: Socket.io 4.7.2
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validation**: Built-in validation with error handling

## Installation & Setup

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn package manager

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy the environment example file and configure your settings:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
HELMET_ENABLED=true
COMPRESSION_ENABLED=true
LOG_LEVEL=info
```

### 3. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on the configured port (default: 5000).

## API Endpoints

### 🔐 **Authentication**
All protected endpoints require authentication headers:
```
role: teacher|student
userId: unique-user-identifier
```

### 📊 **Poll Management**

#### Create Poll (Teacher Only)
```http
POST /api/polls
Content-Type: application/json

{
  "question": "What is the capital of France?",
  "options": [
    {"text": "London", "isCorrect": false},
    {"text": "Paris", "isCorrect": true},
    {"text": "Berlin", "isCorrect": false}
  ],
  "timeLimit": 60
}
```

#### Get Active Poll
```http
GET /api/polls/active
```

#### Submit Answer (Student)
```http
POST /api/polls/{pollId}/answer
Content-Type: application/json

{
  "answer": 2
}
```

#### End Poll (Teacher Only)
```http
PUT /api/polls/{pollId}/end
```

#### Get Poll History (Teacher Only)
```http
GET /api/polls/history
```

#### Get Poll Results
```http
GET /api/polls/{pollId}/results
```

### 👥 **User Management**

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "role": "student"
}
```

#### Get User Information
```http
GET /api/users/{userId}
```

#### Update User
```http
PUT /api/users/{userId}
Content-Type: application/json

{
  "name": "John Smith"
}
```

#### Remove User (Teacher Only)
```http
DELETE /api/users/{userId}
```

#### Get All Participants
```http
GET /api/users/participants/all
```

### 💬 **Chat System**

#### Get Chat History
```http
GET /api/chat/history?limit=50&before=2024-01-01T00:00:00Z
```

#### Send Message
```http
POST /api/chat/message
Content-Type: application/json

{
  "text": "Hello everyone!",
  "recipientId": "optional-user-id-for-private-messages"
}
```

#### Get Chat Participants
```http
GET /api/chat/participants
```

## Socket.io Events

### 🔌 **Connection Events**

#### Authenticate
```javascript
socket.emit('authenticate', {
  userId: 'user123',
  role: 'student',
  name: 'John Doe'
});
```

#### Authentication Response
```javascript
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
});
```

### 📊 **Poll Events**

#### Create Poll (Teacher)
```javascript
socket.emit('create_poll', {
  question: 'What is 2+2?',
  options: [
    {text: '3', isCorrect: false},
    {text: '4', isCorrect: true},
    {text: '5', isCorrect: false}
  ],
  timeLimit: 60
});
```

#### Poll Created (Broadcast)
```javascript
socket.on('poll_created', (poll) => {
  console.log('New poll:', poll);
});
```

#### Submit Answer (Student)
```javascript
socket.emit('submit_answer', {
  pollId: 'poll123',
  answer: 2
});
```

#### Poll Results Updated (Broadcast)
```javascript
socket.on('poll_results_updated', (data) => {
  console.log('Results updated:', data);
});
```

#### End Poll (Teacher)
```javascript
socket.emit('end_poll', 'poll123');
```

#### Poll Ended (Broadcast)
```javascript
socket.on('poll_ended', (poll) => {
  console.log('Poll ended:', poll);
});
```

### 💬 **Chat Events**

#### Send Message
```javascript
socket.emit('send_message', {
  text: 'Hello everyone!',
  recipientId: null // null for broadcast, user ID for private
});
```

#### New Message (Broadcast)
```javascript
socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

#### Private Message
```javascript
socket.on('private_message', (message) => {
  console.log('Private message:', message);
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing_start', { recipientId: null });

// Stop typing
socket.emit('typing_stop', { recipientId: null });
```

### 👥 **User Events**

#### User Joined (Broadcast)
```javascript
socket.on('user_joined', (user) => {
  console.log('User joined:', user);
});
```

#### User Left (Broadcast)
```javascript
socket.on('user_left', (user) => {
  console.log('User left:', user);
});
```

#### Participants Update
```javascript
socket.on('participants_update', (participants) => {
  console.log('Participants:', participants);
});
```

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── pollController.js
│   ├── userController.js
│   └── chatController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── routes/               # API route definitions
│   ├── index.js
│   ├── pollRoutes.js
│   ├── userRoutes.js
│   └── chatRoutes.js
├── services/             # Business logic
│   ├── pollManager.js
│   ├── userManager.js
│   └── chatManager.js
├── socket/               # Socket.io handlers
│   └── socketHandlers.js
├── utils/                # Utility functions
│   └── logger.js
├── logs/                 # Log files (auto-created)
├── .env                  # Environment variables
├── env.example           # Environment template
├── package.json          # Dependencies and scripts
├── server.js             # Main server file
└── README.md             # This file
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `CORS_ORIGIN` | http://localhost:3000 | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `HELMET_ENABLED` | true | Enable security headers |
| `COMPRESSION_ENABLED` | true | Enable gzip compression |
| `LOG_LEVEL` | info | Logging level |

### Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: Standard rate limit headers included

### CORS Configuration
- **Origin**: Configurable via environment variable
- **Credentials**: Supported for authenticated requests
- **Methods**: GET, POST, PUT, DELETE

## Logging

The application uses Winston for structured logging with the following features:

- **Console Output**: Colored, formatted logs for development
- **File Logging**: Separate files for errors and all logs
- **Log Levels**: error, warn, info, http, debug
- **Timestamp**: ISO format timestamps
- **Context**: Request details and user information

### Log Files
- `logs/error.log` - Error level and above
- `logs/all.log` - All log levels

## Error Handling

### HTTP Error Responses
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Socket Error Events
```javascript
socket.on('auth_error', (data) => {
  console.error('Auth error:', data.message);
});

socket.on('poll_error', (data) => {
  console.error('Poll error:', data.message);
});
```

## Testing

### Manual Testing
1. Start the server: `npm run dev`
2. Use tools like Postman or curl to test API endpoints
3. Use Socket.io client tools to test real-time functionality

### Health Check
```bash
curl http://localhost:5000/health
```

## Production Deployment

### Environment Setup
```bash
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
```

### Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "polling-backend"

# Using Docker
docker build -t polling-backend .
docker run -p 5000:5000 polling-backend
```

### Security Considerations
- Enable HTTPS in production
- Use environment variables for sensitive data
- Implement proper authentication (JWT recommended)
- Regular security updates
- Monitor rate limiting and abuse

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

#### CORS Issues
- Verify `CORS_ORIGIN` in environment
- Check frontend origin matches backend configuration

#### Socket Connection Issues
- Verify Socket.io client configuration
- Check for firewall/network restrictions
- Ensure proper authentication data

### Debug Mode
```bash
LOG_LEVEL=debug npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error details
3. Create an issue with detailed information
4. Include environment details and error messages


