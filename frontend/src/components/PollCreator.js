import React, { useState } from 'react';
import styled from 'styled-components';

const CreatorContainer = styled.div`
  max-width: 800px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #373737;
  margin-bottom: 16px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #373737;
  margin-bottom: 8px;
`;

const QuestionInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 16px;
  border: 2px solid #F2F2F2;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #7765DA;
  }
  
  &::placeholder {
    color: #6E6E6E;
  }
`;

const CharCounter = styled.div`
  text-align: right;
  font-size: 12px;
  color: #6E6E6E;
  margin-top: 4px;
`;

const TimeLimitContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TimeLimitSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #F2F2F2;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #7765DA;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const OptionInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #F2F2F2;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #7765DA;
  }
  
  &::placeholder {
    color: #6E6E6E;
  }
`;

const CorrectAnswerGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #373737;
  cursor: pointer;
`;

const RadioInput = styled.input`
  cursor: pointer;
`;

const AddOptionButton = styled.button`
  background: #7765DA;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #6B5BC7;
  }
`;

const RemoveOptionButton = styled.button`
  background: #F2F2F2;
  color: #6E6E6E;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #E0E0E0;
  }
`;

const AskQuestionButton = styled.button`
  background: linear-gradient(135deg, #7765DA, #5767D0);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 20px;
  
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

const PollCreator = ({ onCreatePoll }) => {
  const [question, setQuestion] = useState('');
  const [timeLimit, setTimeLimit] = useState(60);
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);

  const handleQuestionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setQuestion(value);
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    if (field === 'text') {
      newOptions[index].text = value;
    } else if (field === 'isCorrect') {
      // Reset all options to false first
      newOptions.forEach(opt => opt.isCorrect = false);
      newOptions[index].isCorrect = value;
    }
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = () => {
    if (question.trim() && options.some(opt => opt.text.trim())) {
      const pollData = {
        question: question.trim(),
        timeLimit: parseInt(timeLimit),
        options: options.filter(opt => opt.text.trim()).map((opt, index) => ({
          id: index + 1,
          text: opt.text.trim(),
          isCorrect: opt.isCorrect
        }))
      };
      onCreatePoll(pollData);
    }
  };

  const isValid = question.trim() && options.some(opt => opt.text.trim());

  return (
    <CreatorContainer>
      <Section>
        <SectionTitle>Enter your question</SectionTitle>
        <InputGroup>
          <QuestionInput
            placeholder="Enter your question here..."
            value={question}
            onChange={handleQuestionChange}
            maxLength={100}
          />
          <CharCounter>{question.length}/100</CharCounter>
        </InputGroup>
        
        <InputGroup>
          <Label>Time Limit</Label>
          <TimeLimitContainer>
            <TimeLimitSelect
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            >
              <option value={30}>30 seconds</option>
              <option value={45}>45 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
              <option value={120}>120 seconds</option>
            </TimeLimitSelect>
          </TimeLimitContainer>
        </InputGroup>
      </Section>

      <Section>
        <SectionTitle>Edit Options</SectionTitle>
        <OptionsContainer>
          {options.map((option, index) => (
            <OptionRow key={index}>
              <OptionInput
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
              />
              
              <CorrectAnswerGroup>
                <Label>Is it Correct?</Label>
                <RadioGroup>
                  <RadioLabel>
                    <RadioInput
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.isCorrect}
                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                    />
                    Yes
                  </RadioLabel>
                  <RadioLabel>
                    <RadioInput
                      type="radio"
                      name={`correct-${index}`}
                      checked={!option.isCorrect}
                      onChange={(e) => handleOptionChange(index, 'isCorrect', !e.target.checked)}
                    />
                    No
                  </RadioLabel>
                </RadioGroup>
              </CorrectAnswerGroup>
              
              {options.length > 2 && (
                <RemoveOptionButton onClick={() => removeOption(index)}>
                  Remove
                </RemoveOptionButton>
              )}
            </OptionRow>
          ))}
        </OptionsContainer>
        
        {options.length < 6 && (
          <AddOptionButton onClick={addOption}>
            + Add More option
          </AddOptionButton>
        )}
      </Section>

      <AskQuestionButton onClick={handleSubmit} disabled={!isValid}>
        Ask Question
      </AskQuestionButton>
    </CreatorContainer>
  );
};

export default PollCreator;
