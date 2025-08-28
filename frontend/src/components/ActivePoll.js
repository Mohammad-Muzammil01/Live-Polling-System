import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const PollContainer = styled.div`
  display: flex;
  gap: 30px;
  align-items: flex-start;
`;

const PollSection = styled.div`
  flex: 1;
`;

const QuestionSection = styled.div`
  margin-bottom: 30px;
`;

const QuestionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #373737;
  margin-bottom: 16px;
`;

const Card = styled.div`
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  overflow: hidden;
  background: #FFFFFF;
`;

const CardHeader = styled.div`
  background: linear-gradient(180deg, #6B6B6B, #4A4A4A);
  color: #FFFFFF;
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 700;
`;

const QuestionText = styled.div`
  padding: 0;
  margin: 0;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.isHighlighted ? '#F8F7FF' : 'white'};
  border: 1px solid ${props => props.isHighlighted ? '#CABDFF' : '#F2F2F2'};
  transition: all 0.2s ease;
`;

const OptionNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isHighlighted ? '#7765DA' : '#F2F2F2'};
  color: ${props => props.isHighlighted ? 'white' : '#6E6E6E'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
`;

const OptionText = styled.div`
  flex: 1;
  font-size: 16px;
  color: #373737;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 12px;
  background: #F2F2F2;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #CABDFF;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.percentage > 0 ? '#7765DA' : 'transparent'};
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const PercentageText = styled.div`
  font-size: 14px;
  color: #6E6E6E;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
`;

const AskNewQuestionButton = styled.button`
  background: #7765DA;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 20px;
  
  &:hover {
    background: #6B5BC7;
    transform: translateY(-2px);
  }
`;

const ParticipantsSection = styled.div`
  width: 350px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #373737;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Tab = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isActive ? '#7765DA' : '#F2F2F2'};
  color: ${props => props.isActive ? 'white' : '#6E6E6E'};
  
  &:hover {
    background: ${props => props.isActive ? '#6B5BC7' : '#E0E0E0'};
  }
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
  padding: 12px;
  background: #F8F9FA;
  border-radius: 6px;
`;

const ParticipantName = styled.div`
  font-size: 14px;
  color: #373737;
  font-weight: 500;
`;

const KickOutButton = styled.button`
  background: #F2F2F2;
  color: #6E6E6E;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #E0E0E0;
    color: #D32F2F;
  }
`;

const ActivePoll = ({ question, onEndPoll, onRemoveStudent, onKickStudent }) => {
  const [activeTab, setActiveTab] = useState('participants');
  const { participants } = useSelector((state) => state.poll);

  if (!question) return null;

  const totalVotes = Object.values(question.results || {}).reduce((sum, count) => sum + count, 0);
  
  const calculatePercentage = (optionId) => {
    if (totalVotes === 0) return 0;
    const votes = question.results?.[optionId] || 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getHighlightedOption = () => {
    if (!question.results) return null;
    let maxVotes = 0;
    let highlightedOption = null;
    
    Object.entries(question.results).forEach(([optionId, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        highlightedOption = optionId;
      }
    });
    
    return highlightedOption;
  };

  const highlightedOption = getHighlightedOption();

  return (
    <PollContainer>
      <PollSection>
        <QuestionSection>
          <QuestionTitle>Question</QuestionTitle>
          <Card>
            <CardHeader>
              {question.question}
            </CardHeader>
            <OptionsContainer>
            {question.options.map((option) => {
              const percentage = calculatePercentage(option.id);
              const isHighlighted = highlightedOption === option.id.toString();
              
              return (
                <OptionItem key={option.id} isHighlighted={isHighlighted}>
                  <OptionNumber isHighlighted={isHighlighted}>
                    {option.id}
                  </OptionNumber>
                  <OptionText>{option.text}</OptionText>
                  <ProgressBar>
                    <ProgressFill percentage={percentage} />
                  </ProgressBar>
                  <PercentageText>{percentage}%</PercentageText>
                </OptionItem>
              );
            })}
            </OptionsContainer>
          </Card>
          
          <AskNewQuestionButton onClick={onEndPoll}>
            + Ask a new question
          </AskNewQuestionButton>
        </QuestionSection>
      </PollSection>

      <ParticipantsSection>
        <SectionHeader>
          <SectionTitle>Participants</SectionTitle>
          <TabContainer>
            <Tab
              isActive={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </Tab>
            <Tab
              isActive={activeTab === 'participants'}
              onClick={() => setActiveTab('participants')}
            >
              Participants
            </Tab>
          </TabContainer>
        </SectionHeader>

        {activeTab === 'participants' && (
          <ParticipantsList>
            {participants.map((participant) => (
              <ParticipantItem key={participant.id}>
                <ParticipantName>{participant.name}</ParticipantName>
                <KickOutButton onClick={() => (onKickStudent ? onKickStudent(participant.id) : onRemoveStudent(participant.id))}>
                  Kick out
                </KickOutButton>
              </ParticipantItem>
            ))}
          </ParticipantsList>
        )}
        
        {activeTab === 'chat' && (
          <div style={{ textAlign: 'center', color: '#6E6E6E', padding: '20px' }}>
            Chat feature will be implemented here
          </div>
        )}
      </ParticipantsSection>
    </PollContainer>
  );
};

export default ActivePoll;
