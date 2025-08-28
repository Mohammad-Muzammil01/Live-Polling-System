import { configureStore } from '@reduxjs/toolkit';
import pollReducer from './pollSlice';
import chatReducer from './chatSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    poll: pollReducer,
    chat: chatReducer,
    user: userReducer,
  },
});
