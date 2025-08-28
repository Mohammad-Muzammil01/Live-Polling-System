import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const MessageContainer = styled.div`
  text-align: center;
  max-width: 400px;
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
  margin-bottom: 40px;
`;

const StarIcon = styled.span`
  font-size: 16px;
`;

const MainMessage = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #D32F2F;
  margin-bottom: 16px;
`;

const Explanation = styled.p`
  font-size: 16px;
  color: #6E6E6E;
  line-height: 1.5;
  margin-bottom: 32px;
`;

const TryAgainButton = styled.button`
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
`;

const KickedOutMessage = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/');
  };

  return (
    <MessageContainer>
      <BrandTag>
        <StarIcon>⭐</StarIcon>
        Intervue Poll
      </BrandTag>
      
      <MainMessage>You've been Kicked out!</MainMessage>
      
      <Explanation>
        Looks like the teacher had removed you from the poll system. Please Try again sometime.
      </Explanation>
      
      <TryAgainButton onClick={handleTryAgain}>
        Try Again
      </TryAgainButton>
    </MessageContainer>
  );
};

export default KickedOutMessage;
