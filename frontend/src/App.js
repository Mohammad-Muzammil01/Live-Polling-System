import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Welcome from './components/Welcome';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ChatPopup from './components/ChatPopup';
import KickedOutMessage from './components/KickedOutMessage';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
`;

const App = () => {
  const { isAuthenticated, role } = useSelector((state) => state.user);
  const { isOpen: isChatOpen } = useSelector((state) => state.chat);

  return (
    <AppContainer>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              role === 'teacher' ? (
                <Navigate to="/teacher" replace />
              ) : (
                <Navigate to="/student" replace />
              )
            ) : (
              <Welcome />
            )
          } 
        />
        <Route 
          path="/teacher" 
          element={
            isAuthenticated && role === 'teacher' ? (
              <TeacherDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/student" 
          element={
            isAuthenticated && role === 'student' ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="/kicked" element={<KickedOutMessage />} />
      </Routes>
      
      {isChatOpen && <ChatPopup />}
    </AppContainer>
  );
};

export default App;
