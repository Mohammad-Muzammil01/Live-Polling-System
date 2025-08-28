import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { updateResults, updateTimeRemaining } from '../store/pollSlice';
import socketService from '../services/socketService';

const PollContainer = styled.div`
  width: 100%;
  max-width: 800px;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const QuestionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #373737;
`;

const Timer = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.timeRemaining <= 10 ? '#D32F2F' : '#6E6E6E'};
  padding: 8px 16px;
  background: ${props => props.timeRemaining <= 10 ? '#FFEBEE' : '#F2F2F2'};
  border-radius: 20px;
  min-width: 80px;
  text-align: center;
`;

const QuestionText = styled.div`
  background: linear-gradient(180deg, #6B6B6B, #4A4A4A);
  padding: 14px 16px;
  border-radius: 8px 8px 0 0;
  font-size: 16px;
  color: #FFFFFF;
  margin-bottom: 0;
  line-height: 1.4;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  border: 1px solid #EAEAEA;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 12px;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.isSelected ? '#F8F7FF' : 'white'};
  border: 2px solid ${props => props.isSelected ? '#7765DA' : '#F2F2F2'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover {
    ${props => !props.disabled && `
      border-color: #7765DA;
      background: #F8F7FF;
    `}
  }
`;

const OptionNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isSelected ? '#7765DA' : '#F2F2F2'};
  color: ${props => props.isSelected ? 'white' : '#6E6E6E'};
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
  width: 200px;
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
  font-size: 12px;
  color: #373737;
  font-weight: 700;
  min-width: 40px;
  text-align: right;
`;

const ResultsContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #EAEAEA;
`;

const ResultsTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #373737;
  margin-bottom: 16px;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #E9ECEF;
`;

const ResultProgressBar = styled.div`
  flex: 1;
  height: 12px;
  background: #F2F2F2;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #CABDFF;
`;

const ResultProgressFill = styled.div`
  height: 100%;
  background: ${props => props.percentage > 0 ? '#7765DA' : 'transparent'};
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ResultPercentage = styled.div`
  font-size: 12px;
  color: #373737;
  font-weight: 700;
  min-width: 40px;
  text-align: right;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #7765DA, #5767D0);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
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

const WaitingMessage = styled.div`
  text-align: center;
  color: #6E6E6E;
  font-size: 16px;
  margin-top: 20px;
  padding: 20px;
  background: #F8F9FA;
  border-radius: 8px;
`;

const StudentPoll = ({ question, timeRemaining, studentName }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeRemaining || question.timeLimit || 60);
  const timerRef = useRef(null);
  const dispatch = useDispatch();
  const pollState = useSelector((state) => state.poll);
  const results = pollState.currentQuestion?.results || pollState.results || {};

  // Countdown timer
  useEffect(() => {
    setTimeLeft(timeRemaining || question.timeLimit || 60);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        dispatch(updateTimeRemaining(Math.max(next, 0)));
        if (next <= 0) {
          clearInterval(timerRef.current);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  // Listen to live results
  useEffect(() => {
    const handler = (payload) => {
      if (!payload) return;
      dispatch(updateResults(payload.results || {}));
    };
    socketService.onAnswerSubmitted(handler);
    return () => {
      socketService.off('poll_results_updated');
      socketService.off('answer_submitted');
    };
  }, [dispatch]);

  const handleOptionSelect = (optionId) => {
    if (!hasSubmitted && timeRemaining > 0) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || hasSubmitted) return;
    try {
      socketService.submitAnswer({
        questionId: question.id,
        answer: selectedOption,
        participantId: studentName
      });
      setHasSubmitted(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePercentage = (optionId) => {
    if (!results || Object.keys(results).length === 0) return 0;
    const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
    const votes = results[optionId] || 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const isDisabled = hasSubmitted || timeLeft <= 0;

  return (
    <PollContainer>
      <QuestionHeader>
        <QuestionTitle>Question 1</QuestionTitle>
        <Timer timeRemaining={timeLeft}>
          {formatTime(Math.max(timeLeft, 0))}
        </Timer>
      </QuestionHeader>

      <QuestionText>{question.question}</QuestionText>

      <OptionsContainer>
        {question.options.map((option) => {
          const percentage = calculatePercentage(option.id);
          return (
            <OptionItem
              key={option.id}
              isSelected={selectedOption === option.id}
              disabled={isDisabled}
              onClick={() => handleOptionSelect(option.id)}
            >
              <OptionNumber isSelected={selectedOption === option.id}>
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

      <SubmitButton
        onClick={handleSubmit}
        disabled={!selectedOption || hasSubmitted || timeLeft <= 0}
      >
        {hasSubmitted ? 'Submitted!' : 'Submit'}
      </SubmitButton>

      {/* Results inline with options per Figma; no separate results card */}

      <WaitingMessage>
        Wait for the teacher to ask a new question..
      </WaitingMessage>
    </PollContainer>
  );
};

export default StudentPoll;