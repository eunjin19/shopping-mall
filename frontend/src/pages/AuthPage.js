import React, { useState } from "react";
import Login from "../components/Login";
import Register from "../components/Register";
import { useNavigate } from "react-router-dom"; // 페이지 이동용
import "./AuthPage.css";

const AuthPage = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState("login");
  const navigate = useNavigate(); // navigate 훅 추가

  // 로그인 성공 처리
  const handleLoginSuccess = (token, user) => {
    // 1️⃣ 상위 컴포넌트에 로그인 정보 전달
    onAuthSuccess?.(token, user);

    // 2️⃣ localStorage에 토큰/사용자 정보 저장
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // 3️⃣ 홈페이지로 이동
    navigate("/"); // "/"는 홈 페이지 경로
  };

  const handleRegisterSuccess = () => {
    alert("회원가입이 완료되었습니다. 로그인해주세요.");
    setCurrentView("login");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {currentView === "login" ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView("register")}
          />
        ) : (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentView("login")}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
