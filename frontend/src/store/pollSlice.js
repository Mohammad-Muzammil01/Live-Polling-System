import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  currentQuestion: null,
  pollHistory: [],
  isActive: false,
  timeRemaining: 60,
  participants: [],
  loading: false,
  error: null,
};

export const createPoll = createAsyncThunk(
  'poll/createPoll',
  async (pollData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      id: uuidv4(),
      ...pollData,
      createdAt: new Date().toISOString(),
      results: {},
      answeredBy: [],
    };
  }
);

export const submitAnswer = createAsyncThunk(
  'poll/submitAnswer',
  async ({ questionId, answer, participantId }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return { questionId, answer, participantId };
  }
);

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
      state.isActive = true;
      state.timeRemaining = action.payload.timeLimit || 60;
      state.participants = action.payload.participants || [];
    },
    updateTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
      if (state.timeRemaining <= 0) {
        state.isActive = false;
      }
    },
    addParticipant: (state, action) => {
      if (!state.participants.find(p => p.id === action.payload.id)) {
        state.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(
        p => p.id !== action.payload
      );
    },
    updateResults: (state, action) => {
      if (state.currentQuestion) {
        state.currentQuestion.results = action.payload;
      }
    },
    endPoll: (state) => {
      if (state.currentQuestion) {
        state.pollHistory.push({
          ...state.currentQuestion,
          endedAt: new Date().toISOString(),
        });
      }
      state.currentQuestion = null;
      state.isActive = false;
      state.timeRemaining = 60;
    },
    resetPoll: (state) => {
      state.currentQuestion = null;
      state.isActive = false;
      state.timeRemaining = 60;
      state.results = {};
    },
    addToHistory: (state, action) => {
      state.pollHistory.push({
        ...action.payload,
        endedAt: new Date().toISOString(),
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPoll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
        state.isActive = true;
        state.timeRemaining = action.payload.timeLimit || 60;
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        const { questionId, answer, participantId } = action.payload;
        if (state.currentQuestion && state.currentQuestion.id === questionId) {
          if (!state.currentQuestion.results[answer]) {
            state.currentQuestion.results[answer] = 0;
          }
          state.currentQuestion.results[answer]++;
          
          if (!state.currentQuestion.answeredBy.includes(participantId)) {
            state.currentQuestion.answeredBy.push(participantId);
          }
        }
      });
  },
});

export const {
  setCurrentQuestion,
  updateTimeRemaining,
  addParticipant,
  removeParticipant,
  updateResults,
  endPoll,
  resetPoll,
  addToHistory,
} = pollSlice.actions;

export default pollSlice.reducer;
