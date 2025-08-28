import React from 'react';
import styled from 'styled-components';

const ChatIconContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #7765DA, #5767D0);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(119, 101, 218, 0.3);
  transition: all 0.2s ease;
  z-index: 1000;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(119, 101, 218, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ChatBubble = styled.div`
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: -4px;
    right: 2px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid white;
  }
`;

const ChatIcon = ({ onClick }) => {
  return (
    <ChatIconContainer onClick={onClick}>
      <ChatBubble />
    </ChatIconContainer>
  );
};

export default ChatIcon;
