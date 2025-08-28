import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { toggleChat, setActiveTab, addMessage } from '../store/chatSlice';
import socketService from '../services/socketService';

const ChatOverlay = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  pointer-events: none;
`;

const ChatContainer = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  width: 420px;
  height: 360px;
  display: flex;
  flex-direction: column;
  border: 1px solid #EAEAEA;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  pointer-events: auto;
`;

const ChatHeader = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid #EAEAEA;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #6E6E6E;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #6E6E6E;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #F2F2F2;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #EAEAEA;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: #6E6E6E;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  ${(props) => props.isActive && `color: #373737;`}

  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    height: 2px;
    width: ${props => props.isActive ? '100%' : '0'};
    background: #7765DA;
    transition: width 0.2s ease;
  }
`;

const ChatContent = styled.div`
  flex: 1;
  padding: 12px;
  overflow-y: auto;
`;

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  background: ${props => props.isOwn ? '#7765DA' : '#F2F2F2'};
  color: ${props => props.isOwn ? 'white' : '#373737'};
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
`;

const MessageSender = styled.div`
  font-size: 12px;
  color: #6E6E6E;
  margin-bottom: 4px;
  font-weight: 500;
`;

const ParticipantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ParticipantItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #FFFFFF;
  border-radius: 6px;
  border: 1px solid #F2F2F2;
`;

const ParticipantName = styled.div`
  font-size: 14px;
  color: #373737;
  font-weight: 500;
`;

const ParticipantStatus = styled.div`
  font-size: 12px;
  color: #6E6E6E;
`;

const ChatInput = styled.div`
  padding: 10px 12px;
  border-top: 1px solid #EAEAEA;
  display: flex;
  gap: 8px;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #EAEAEA;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #7765DA;
  }
  
  &::placeholder {
    color: #6E6E6E;
  }
`;

const SendButton = styled.button`
  background: #7765DA;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #6B5BC7;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChatPopup = () => {
  const [message, setMessage] = useState('');
  const [currentUser] = useState('User ' + Math.floor(Math.random() * 1000) + 1);
  const dispatch = useDispatch();
  const { isOpen, activeTab, messages, participants } = useSelector((state) => state.chat);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for real-time chat events
  useEffect(() => {
    if (!isOpen) return;

    const handleIncoming = (messageData) => {
      dispatch(addMessage({
        id: messageData.id || Date.now().toString(),
        sender: messageData.sender || messageData.senderName || 'User',
        text: messageData.text,
        isOwn: false
      }));
    };

    const handleSent = (messageData) => {
      dispatch(addMessage({
        id: messageData.id || Date.now().toString(),
        sender: messageData.sender || messageData.senderName || currentUser,
        text: messageData.text,
        isOwn: true
      }));
    };

    socketService.onMessageReceived(handleIncoming);
    socketService.onMessageSent(handleSent);

    socketService.onUserTyping(() => {});
    socketService.onUserStoppedTyping(() => {});

    return () => {
      socketService.off('new_message');
      socketService.off('private_message');
      socketService.off('message_sent');
      socketService.off('user_typing');
      socketService.off('user_stopped_typing');
    };
  }, [isOpen, dispatch, currentUser]);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(toggleChat());
  };

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    socketService.sendMessage({
      sender: currentUser,
      text: message.trim(),
      timestamp: new Date().toISOString()
    });
    // Do not push to store here; rely on message_sent echo to avoid duplicates
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <ChatOverlay>
      <ChatContainer>
        <ChatHeader>
          <ChatTitle>Chat & Participants</ChatTitle>
          <CloseButton onClick={handleClose}>&times;</CloseButton>
        </ChatHeader>

        <TabContainer>
          <Tab
            isActive={activeTab === 'chat'}
            onClick={() => handleTabChange('chat')}
          >
            Chat
          </Tab>
          <Tab
            isActive={activeTab === 'participants'}
            onClick={() => handleTabChange('participants')}
          >
            Participants
          </Tab>
        </TabContainer>

        <ChatContent>
          {activeTab === 'chat' ? (
            <MessagesContainer>
              {messages.map((msg) => (
                <MessageItem key={msg.id} isOwn={msg.isOwn}>
                  <MessageSender>{msg.sender}</MessageSender>
                  <MessageBubble isOwn={msg.isOwn}>
                    {msg.text}
                  </MessageBubble>
                </MessageItem>
              ))}
              <div ref={messagesEndRef} />
            </MessagesContainer>
          ) : (
            <ParticipantsList>
              {participants.length > 0 ? (
                participants.map((participant) => (
                  <ParticipantItem key={participant.id}>
                    <ParticipantName>{participant.name}</ParticipantName>
                    <ParticipantStatus>Online</ParticipantStatus>
                  </ParticipantItem>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#6E6E6E', padding: '20px' }}>
                  No participants yet
                </div>
              )}
            </ParticipantsList>
          )}
        </ChatContent>

        {activeTab === 'chat' && (
          <ChatInput>
            <MessageInput
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <SendButton onClick={handleSendMessage} disabled={!message.trim()}>
              Send
            </SendButton>
          </ChatInput>
        )}
      </ChatContainer>
    </ChatOverlay>
  );
};

export default ChatPopup;
