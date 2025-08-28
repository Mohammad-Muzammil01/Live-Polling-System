import React from 'react';
import styled from 'styled-components';

const HistoryContainer = styled.div`
  max-width: 800px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #373737;
`;

const BackButton = styled.button`
  background: #F2F2F2;
  color: #6E6E6E;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #E0E0E0;
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HistoryItem = styled.div`
  background: #F8F9FA;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #E9ECEF;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const QuestionText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #373737;
  line-height: 1.4;
  flex: 1;
  margin-right: 20px;
`;

const QuestionMeta = styled.div`
  text-align: right;
  min-width: 120px;
`;

const QuestionNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #7765DA;
  margin-bottom: 4px;
`;

const DateText = styled.div`
  font-size: 12px;
  color: #6E6E6E;
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #E9ECEF;
`;

const OptionNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F2F2F2;
  color: #6E6E6E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
`;

const OptionText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #373737;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 150px;
  height: 6px;
  background: #F2F2F2;
  border-radius: 3px;
  overflow: hidden;
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
  min-width: 40px;
  text-align: right;
`;

const NoHistoryMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6E6E6E;
  font-size: 16px;
`;

const PollHistory = ({ history, onBack }) => {
  if (!history || history.length === 0) {
    return (
      <HistoryContainer>
        <Header>
          <Title>View Poll History</Title>
          <BackButton onClick={onBack}>← Back</BackButton>
        </Header>
        
        <NoHistoryMessage>
          No poll history available yet. Create and run some polls to see results here!
        </NoHistoryMessage>
      </HistoryContainer>
    );
  }

  const calculatePercentage = (optionId, results) => {
    const totalVotes = Object.values(results || {}).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
    const votes = results?.[optionId] || 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <HistoryContainer>
      <Header>
        <Title>View Poll History</Title>
        <BackButton onClick={onBack}>← Back</BackButton>
      </Header>

      <HistoryList>
        {history.map((poll, index) => (
          <HistoryItem key={poll.id}>
            <QuestionHeader>
              <QuestionText>{poll.question}</QuestionText>
              <QuestionMeta>
                <QuestionNumber>Question {history.length - index}</QuestionNumber>
                <DateText>{formatDate(poll.createdAt)}</DateText>
              </QuestionMeta>
            </QuestionHeader>

            <ResultsContainer>
              {poll.options.map((option) => {
                const percentage = calculatePercentage(option.id, poll.results);
                
                return (
                  <ResultItem key={option.id}>
                    <OptionNumber>{option.id}</OptionNumber>
                    <OptionText>{option.text}</OptionText>
                    <ProgressBar>
                      <ProgressFill percentage={percentage} />
                    </ProgressBar>
                    <PercentageText>{percentage}%</PercentageText>
                  </ResultItem>
                );
              })}
            </ResultsContainer>
          </HistoryItem>
        ))}
      </HistoryList>
    </HistoryContainer>
  );
};

export default PollHistory;
