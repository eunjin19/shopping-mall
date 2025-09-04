import React, { useState } from 'react';
import Login from "../components/Login"
import Register from "../components/Regiseter"
import './AuthPage.css';

const AuthPage = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState('login'); // 'login' 또는 'register'

  const handleLoginSuccess = (token, user) => {
    onAuthSuccess(token, user);
  };

  const handleRegisterSuccess = () => {
    alert('회원가입이 완료되었습니다. 로그인해주세요.');
    setCurrentView('login');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {currentView === 'login' ? (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <Register 
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;