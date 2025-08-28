import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { logout } from '../store/userSlice';
import { createPoll, endPoll, removeParticipant, setCurrentQuestion, addToHistory, updateResults } from '../store/pollSlice';
import { toggleChat, addMessage, addParticipant as addChatParticipant, removeParticipant as removeChatParticipant } from '../store/chatSlice';
import PollCreator from './PollCreator';
import ActivePoll from './ActivePoll';
import PollHistory from './PollHistory';
import ChatIcon from './ChatIcon';
import socketService from '../services/socketService';

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

const HeaderActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const ViewHistoryButton = styled.button`
  background: white;
  color: #373737;
  border: 2px solid #F2F2F2;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #7765DA;
    background: #F8F7FF;
  }
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
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #373737;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #6E6E6E;
  margin-bottom: 30px;
  line-height: 1.5;
`;

const TeacherDashboard = () => {
  const [showHistory, setShowHistory] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentQuestion, isActive, pollHistory } = useSelector((state) => state.poll);
  const { currentUser } = useSelector((state) => state.user);

  // Connect to Socket.io when component mounts
  useEffect(() => {
    if (currentUser) {
      // Wait for authentication to complete before setting up event listeners
      socketService.waitForAuth(() => {
        console.log('Setting up event listeners after authentication');
        
        // Listen for poll-related events
        socketService.onPollCreated((pollData) => {
          console.log('Poll created:', pollData);
          dispatch(setCurrentQuestion(pollData));
        });

        // If there is already an active poll when teacher connects
        socketService.onPollActive((pollData) => {
          console.log('Active poll on connect:', pollData);
          dispatch(setCurrentQuestion(pollData));
        });

        socketService.onAnswerSubmitted((data) => {
          console.log('Results updated:', data);
          if (data && data.results) {
            dispatch(updateResults(data.results));
          }
        });

        socketService.onPollEnded((data) => {
          console.log('Poll ended:', data);
          // Add to history and reset current question
          if (currentQuestion) {
            dispatch(addToHistory(currentQuestion));
            dispatch(setCurrentQuestion(null));
          }
        });

        // Participants updates (for chat sidebar)
        socketService.onParticipantsUpdate((participants) => {
          if (Array.isArray(participants)) {
            participants.forEach((p) => {
              dispatch(addChatParticipant({ id: p.id || p.userId, name: p.name, role: p.role }));
            });
          }
        });

        // User join/leave
        socketService.onUserJoined((data) => {
          dispatch(addChatParticipant({ id: data.userId, name: data.name, role: data.role }));
        });
        socketService.onUserLeft((data) => {
          dispatch(removeChatParticipant(data.userId));
        });

        // Chat messages
        socketService.onMessageReceived((message) => {
          dispatch(addMessage(message));
        });
      });
    }
  }, [currentUser, dispatch, currentQuestion]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleCreatePoll = async (pollData) => {
    try {
      // Create poll through Socket.io for real-time updates
      socketService.createPoll(pollData);
      
      // Also dispatch to Redux for local state management
      await dispatch(createPoll(pollData)).unwrap();
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };

  const handleEndPoll = () => {
    // End poll through Socket.io for real-time updates
    if (currentQuestion) {
      socketService.endPoll(currentQuestion.id);
    }
    
    // Also dispatch to Redux for local state management
    dispatch(endPoll());
  };

  const handleRemoveStudent = (studentId) => {
    dispatch(removeParticipant(studentId));
  };

  const handleKickStudent = (studentId) => {
    try {
      socketService.kickUser(studentId);
    } catch (e) {
      console.error('Failed to kick user', e);
    }
  };

  const handleToggleChat = () => {
    dispatch(toggleChat());
  };

  return (
    <DashboardContainer>
      <Header>
        <BrandTag>
          <StarIcon>⭐</StarIcon>
          Intervue Poll
        </BrandTag>
        
        <HeaderActions>
          <ViewHistoryButton onClick={() => setShowHistory(!showHistory)}>
            👁️ View Poll history
          </ViewHistoryButton>
          <LogoutButton onClick={handleLogout}>
            Logout
          </LogoutButton>
        </HeaderActions>
      </Header>

      <MainContent>
        {!showHistory ? (
          <>
            <Title>Let's Get Started</Title>
            <Description>
              You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
            </Description>

            {!isActive ? (
              <PollCreator onCreatePoll={handleCreatePoll} />
            ) : (
              <ActivePoll
                question={currentQuestion}
                onEndPoll={handleEndPoll}
                onRemoveStudent={handleRemoveStudent}
                onKickStudent={handleKickStudent}
              />
            )}
          </>
        ) : (
          <PollHistory 
            history={pollHistory}
            onBack={() => setShowHistory(false)}
          />
        )}
      </MainContent>

      <ChatIcon onClick={handleToggleChat} />
    </DashboardContainer>
  );
};

export default TeacherDashboard;
