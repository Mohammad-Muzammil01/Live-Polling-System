// Demo data for testing the Live Polling System

export const demoQuestions = [
  {
    id: '1',
    question: 'Which planet is known as the Red Planet?',
    timeLimit: 60,
    options: [
      { id: 1, text: 'Mars', isCorrect: true },
      { id: 2, text: 'Venus', isCorrect: false },
      { id: 3, text: 'Jupiter', isCorrect: false },
      { id: 4, text: 'Saturn', isCorrect: false }
    ],
    results: {
      1: 15, // Mars
      2: 3,  // Venus
      3: 2,  // Jupiter
      4: 5   // Saturn
    },
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    answeredBy: ['student1', 'student2', 'student3', 'student4', 'student5']
  },
  {
    id: '2',
    question: 'What is the capital of France?',
    timeLimit: 45,
    options: [
      { id: 1, text: 'London', isCorrect: false },
      { id: 2, text: 'Paris', isCorrect: true },
      { id: 3, text: 'Berlin', isCorrect: false },
      { id: 4, text: 'Madrid', isCorrect: false }
    ],
    results: {
      1: 2,  // London
      2: 18, // Paris
      3: 1,  // Berlin
      4: 1   // Madrid
    },
    createdAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    answeredBy: ['student1', 'student2', 'student3', 'student4', 'student5', 'student6']
  }
];

export const demoParticipants = [
  { id: 'student1', name: 'Rahul Arora' },
  { id: 'student2', name: 'Pushpender Rautela' },
  { id: 'student3', name: 'Rijul Zalpuri' },
  { id: 'student4', name: 'Nadeem N' },
  { id: 'student5', name: 'Ashwin Sharma' },
  { id: 'student6', name: 'Priya Patel' },
  { id: 'student7', name: 'Amit Kumar' }
];

export const demoMessages = [
  {
    id: '1',
    sender: 'User 1',
    text: 'Hey There, how can I help?',
    timestamp: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    isOwn: false
  },
  {
    id: '2',
    sender: 'User 2',
    text: 'Nothing bro..just chill!!',
    timestamp: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    isOwn: false
  }
];

// Helper function to get demo question by ID
export const getDemoQuestion = (id) => {
  return demoQuestions.find(q => q.id === id);
};

// Helper function to get demo participants
export const getDemoParticipants = () => {
  return [...demoParticipants];
};

// Helper function to get demo messages
export const getDemoMessages = () => {
  return [...demoMessages];
};
