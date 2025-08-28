import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { setRole, login } from '../store/userSlice';
import socketService from '../services/socketService';

const WelcomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const WelcomeCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
  margin-bottom: 24px;
`;

const StarIcon = styled.span`
  font-size: 16px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #373737;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #6E6E6E;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const RoleCardsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const RoleCard = styled.div`
  flex: 1;
  border: 2px solid ${props => props.isSelected ? '#7765DA' : '#F2F2F2'};
  border-radius: 8px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isSelected ? '#F8F7FF' : 'white'};
  
  &:hover {
    border-color: #7765DA;
    background: #F8F7FF;
  }
`;

const RoleTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #373737;
  margin-bottom: 12px;
`;

const RoleDescription = styled.p`
  font-size: 14px;
  color: #6E6E6E;
  line-height: 1.4;
`;

const ContinueButton = styled.button`
  background: linear-gradient(135deg, #7765DA, #5767D0);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(119, 101, 218, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Welcome = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      // Generate a unique user ID
      const userId = Date.now().toString();
      
      // Connect to Socket.io based on role
      if (selectedRole === 'teacher') {
        socketService.connect(userId, selectedRole, teacherName.trim());
      } else {
        // For students, connect immediately with a temporary name so they can receive real-time updates
        socketService.connect(userId, selectedRole, 'Student');
      }
      
      dispatch(setRole(selectedRole));
      if (selectedRole === 'teacher') {
        dispatch(login({ id: userId, role: selectedRole, name: teacherName.trim() }));
      } else {
        dispatch(login({ id: userId, role: selectedRole }));
      }
      navigate(selectedRole === 'teacher' ? '/teacher' : '/student');
    }
  };

  return (
    <WelcomeContainer>
      <WelcomeCard>
        <BrandTag>
          <StarIcon>⭐</StarIcon>
          Intervue Poll
        </BrandTag>
        
        <Title>Welcome to the Live Polling System</Title>
        
        <Description>
          Please select the role that best describes you to begin using the live polling system
        </Description>
        
        <RoleCardsContainer>
          <RoleCard
            isSelected={selectedRole === 'student'}
            onClick={() => handleRoleSelect('student')}
          >
            <RoleTitle>I'm a Student</RoleTitle>
            <RoleDescription>
              Submit answers and view live poll results in real-time.
            </RoleDescription>
          </RoleCard>
          
          <RoleCard
            isSelected={selectedRole === 'teacher'}
            onClick={() => handleRoleSelect('teacher')}
          >
            <RoleTitle>I'm a Teacher</RoleTitle>
            <RoleDescription>
              Create and manage polls, ask questions, and monitor student responses in real-time.
            </RoleDescription>
          </RoleCard>
        </RoleCardsContainer>
        
        {selectedRole === 'teacher' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#373737', marginBottom: '8px', textAlign: 'left' }}>
              Enter your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #F2F2F2',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
            />
          </div>
        )}
        
        <ContinueButton
          onClick={handleContinue}
          disabled={!selectedRole || (selectedRole === 'teacher' && !teacherName.trim())}
        >
          Continue
        </ContinueButton>
      </WelcomeCard>
    </WelcomeContainer>
  );
};

export default Welcome;
