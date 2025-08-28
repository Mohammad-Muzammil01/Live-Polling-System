import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { logout } from '../store/userSlice';
import { submitAnswer, addParticipant, setCurrentQuestion, updateResults } from '../store/pollSlice';
import { addMessage } from '../store/chatSlice';
import { toggleChat } from '../store/chatSlice';
import StudentPoll from './StudentPoll';
import WaitingState from './WaitingState';
import ChatIcon from './ChatIcon';
import socketService from '../services/socketService';
import KickedOutMessage from './KickedOutMessage';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #FFFFFF;
  padding: 20px 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const BrandTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #7765DA, #5767D0);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
`;

const StarIcon = styled.span`
  font-size: 16px;
`;

const LogoutButton = styled.button`
  background: #F2F2F2;
  color: #6E6E6E;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #E0E0E0;
  }
`;

const MainContent = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  padding: 16px 20px;
  min-height: 420px;
  box-shadow: none;
  border: 1px solid #EAEAEA;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StudentDashboard = () => {
  const [studentName, setStudentName] = useState('');
  const [hasEnteredName, setHasEnteredName] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentQuestion, isActive, timeRemaining } = useSelector((state) => state.poll);
  const { currentUser } = useSelector((state) => state.user);
  const { isOpen: isChatOpen } = useSelector((state) => state.chat);
  const [isKicked, setIsKicked] = useState(false);

  useEffect(() => {
    // Check if student name exists in localStorage
    const savedName = localStorage.getItem('studentName');
    if (savedName) {
      setStudentName(savedName);
      setHasEnteredName(true);
      // Add student to participants
      dispatch(addParticipant({ id: Date.now().toString(), name: savedName }));
    }
  }, [dispatch]);

  // Set up event listeners when student name is entered
  useEffect(() => {
    if (hasEnteredName && studentName) {
      // Student is already connected from Welcome component
      // Just set up event listeners if not already set up
      socketService.waitForAuth(() => {
        console.log('Student authenticated, setting up event listeners');
        
        // Listen for new polls from teacher
        socketService.onPollCreated((pollData) => {
          console.log('New poll received:', pollData);
          dispatch(setCurrentQuestion(pollData));
        });

        // If there is an active poll when the student connects
        socketService.onPollActive((pollData) => {
          console.log('Active poll on connect (student):', pollData);
          dispatch(setCurrentQuestion(pollData));
        });

        // Listen for poll ending
        socketService.onPollEnded((data) => {
          console.log('Poll ended:', data);
          // The poll will be automatically reset by the timer or teacher action
        });

        // Live results updates
        socketService.on('poll_results_updated', (data) => {
          if (data && data.results) {
            dispatch(updateResults(data.results));
          }
        });

        // Chat
        socketService.onMessageReceived((message) => {
          dispatch(addMessage(message));
        });

        // Listen for being kicked
        socketService.onUserKicked((data) => {
          setIsKicked(true);
          // optional: close chat overlay if open
          if (isChatOpen) {
            dispatch(toggleChat());
          }
          // Navigate to kicked screen route
          navigate('/kicked');
        });
      });
    }
  }, [hasEnteredName, studentName, dispatch]);

  const handleNameSubmit = () => {
    if (studentName.trim()) {
      localStorage.setItem('studentName', studentName.trim());
      setHasEnteredName(true);
      
      // Update the user name in the socket connection
      socketService.updateUserName(studentName.trim());
      
      // Add student to participants
      dispatch(addParticipant({ id: Date.now().toString(), name: studentName.trim() }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentName');
    dispatch(logout());
    navigate('/');
  };

  const handleToggleChat = () => {
    dispatch(toggleChat());
  };

  if (!hasEnteredName) {
    return (
      <DashboardContainer>
        <Header>
          <BrandTag>
            <StarIcon>⭐</StarIcon>
            Intervue Poll
          </BrandTag>
        </Header>

        <MainContent>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#373737', marginBottom: '16px' }}>
              Let's Get Started
            </h1>
            <p style={{ fontSize: '16px', color: '#6E6E6E', marginBottom: '30px', lineHeight: '1.5' }}>
              If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates.
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#373737', marginBottom: '8px', textAlign: 'left' }}>
                Enter your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #F2F2F2',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              />
            </div>
            
            <button
              onClick={handleNameSubmit}
              disabled={!studentName.trim()}
              style={{
                background: 'linear-gradient(135deg, #7765DA, #5767D0)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: studentName.trim() ? 1 : 0.5,
                cursor: studentName.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Continue
            </button>
          </div>
        </MainContent>
      </DashboardContainer>
    );
  }

  if (isKicked) {
    return (
      <DashboardContainer>
        <Header>
          <BrandTag>
            <StarIcon>⭐</StarIcon>
            Intervue Poll
          </BrandTag>
        </Header>
        <MainContent>
          <KickedOutMessage />
        </MainContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <BrandTag>
          <StarIcon>⭐</StarIcon>
          Intervue Poll
        </BrandTag>
        <LogoutButton onClick={handleLogout}>
          Logout
        </LogoutButton>
      </Header>

      <MainContent>
        {isActive && currentQuestion ? (
          <StudentPoll
            question={currentQuestion}
            timeRemaining={timeRemaining}
            studentName={studentName}
          />
        ) : (
          <WaitingState />
        )}
      </MainContent>

      <ChatIcon onClick={handleToggleChat} />
    </DashboardContainer>
  );
};

export default StudentDashboard;