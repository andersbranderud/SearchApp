import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SearchForm from './components/SearchForm';
import Login from './components/Login';
import Register from './components/Register';
import { authApi } from './services/api';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  return authApi.isAuthenticated() ? children : <Navigate to="/login" />;
};

export const AppContent: React.FC = () => {
  return (
    <div className="App">
      <div className="container">
        <h1 className="title">Multi-Engine Search</h1>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <SearchForm />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
