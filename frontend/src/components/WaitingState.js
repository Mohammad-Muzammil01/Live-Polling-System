import React from 'react';
import styled from 'styled-components';

const WaitingContainer = styled.div`
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

const Spinner = styled.div`
  width: 80px;
  height: 80px;
  border: 6px solid #F2F2F2;
  border-top: 6px solid #7765DA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const WaitingText = styled.div`
  font-size: 18px;
  color: #373737;
  font-weight: 500;
  line-height: 1.4;
`;

const WaitingState = () => {
  return (
    <WaitingContainer>
      <BrandTag>
        <StarIcon>⭐</StarIcon>
        Intervue Poll
      </BrandTag>
      
      <Spinner />
      
      <WaitingText>
        Wait for the teacher to ask questions..
      </WaitingText>
    </WaitingContainer>
  );
};

export default WaitingState;
