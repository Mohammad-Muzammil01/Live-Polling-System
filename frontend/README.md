# Live Polling System

A real-time interactive polling application built with React and Redux, designed for classroom environments with separate interfaces for teachers and students.

## Features

### Teacher Features
- **Create a new poll** - Build custom polls with multiple choice questions
- **View live polling results** - Real-time visualization of student responses
- **Ask new questions** - Only when no question is active or all students have answered
- **Configurable poll time limits** - Set custom time limits (30s to 120s)
- **Remove students** - Kick out participants from the poll system
- **View poll history** - Access results from previous polls

### Student Features
- **Enter name on first visit** - Unique identification for each session
- **Submit answers** - Participate in active polls
- **View live results** - See real-time polling results after submission
- **60-second time limit** - Maximum time to answer questions
- **Wait state** - Clear indication when waiting for new questions

### Bonus Features
- **Chat system** - Real-time communication between teachers and students
- **Participant management** - View and manage active participants
- **Responsive design** - Modern, clean UI that works on all devices

## Technology Stack

- **Frontend**: React 18.2.0
- **State Management**: Redux Toolkit
- **Styling**: Styled Components
- **Routing**: React Router DOM
- **Build Tool**: Create React App
- **Additional**: UUID for unique identifiers

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/           # React components
│   ├── Welcome.js       # Role selection screen
│   ├── TeacherDashboard.js  # Main teacher interface
│   ├── StudentDashboard.js  # Main student interface
│   ├── PollCreator.js   # Poll creation form
│   ├── ActivePoll.js    # Live poll display
│   ├── StudentPoll.js   # Student poll interface
│   ├── PollHistory.js   # Historical results
│   ├── ChatPopup.js     # Chat functionality
│   ├── ChatIcon.js      # Chat toggle button
│   ├── WaitingState.js  # Student waiting screen
│   └── KickedOutMessage.js  # Removal notification
├── store/               # Redux store configuration
│   ├── index.js        # Store setup
│   ├── pollSlice.js    # Poll state management
│   ├── chatSlice.js    # Chat state management
│   └── userSlice.js    # User authentication
├── services/            # Utility services
│   └── timerService.js # Timer management
└── App.js              # Main application component
```

## Usage

### For Teachers
1. Select "I'm a Teacher" role
2. Create polls with custom questions and time limits
3. Monitor live results and participant activity
4. Manage participants and view poll history
5. Use chat to communicate with students

### For Students
1. Select "I'm a Student" role
2. Enter your name (stored locally)
3. Wait for teacher to start a poll
4. Answer questions within the time limit
5. View live results and chat with others

## Color Palette

The application uses a consistent color scheme:
- **Primary Purple**: #7765DA
- **Secondary Blue**: #5767D0
- **Deep Purple**: #4F0DCE
- **Light Gray**: #F2F2F2
- **Dark Gray**: #373737
- **Medium Gray**: #6E6E6E

## State Management

The application uses Redux Toolkit for state management with three main slices:

- **Poll Slice**: Manages poll questions, answers, results, and timing
- **Chat Slice**: Handles chat messages and participant lists
- **User Slice**: Manages user authentication and role selection

## Real-time Features

- Live poll results with progress bars
- Real-time countdown timers
- Instant participant updates
- Live chat functionality
- Dynamic UI updates based on poll state

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Notes

- The system uses localStorage for student name persistence
- Timer functionality is handled by a custom service
- All components are built with styled-components for consistent styling
- The application is fully responsive and mobile-friendly

## Future Enhancements

- WebSocket integration for true real-time updates
- Database persistence for poll history
- User authentication system
- Advanced analytics and reporting
- Mobile app development
- Integration with learning management systems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

