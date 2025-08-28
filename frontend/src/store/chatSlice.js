import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  messages: [],
  participants: [],
  isOpen: false,
  activeTab: 'chat', // 'chat' or 'participants'
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const newMessage = {
        id: uuidv4(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(newMessage);
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
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
    },
  },
});

export const {
  addMessage,
  addParticipant,
  removeParticipant,
  toggleChat,
  setActiveTab,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
