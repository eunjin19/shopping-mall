import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert("사용자명과 비밀번호를 모두 입력해주세요.");
      return;
    }
  
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });
  
      const { token, user } = res.data; // 👈 수정됨
      localStorage.setItem("token", token);
      alert("로그인이 완료되었습니다.");
      onLoginSuccess?.(token, user);
  
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>로그인</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">User</label>
            <input
              id="username"
              type="text"
              placeholder="사용자명을 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="switch-form">
          <p>계정이 없으신가요?</p>
          <button
            type="button"
            className="switch-button"
            onClick={onSwitchToRegister}
            disabled={loading}
          >
            회원가입하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;