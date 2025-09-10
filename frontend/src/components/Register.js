import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      alert("모든 필드를 입력해주세요.");
      return false;
    }
    if (username.trim().length < 3) {
      alert("사용자명은 최소 3자 이상이어야 합니다.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    if (password.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { username, email, password } = formData;
      const res = await axios.post("http://localhost:5000/auth/register", {
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      alert(res.data.message || "회원가입이 완료되었습니다.");
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });
      onRegisterSuccess?.();
    } catch (err) {
      console.error("Register error:", err);
      alert(err.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>회원가입</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="username">User</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="사용자명을 입력하세요 (최소 3자)"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요 (최소 6자)"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="switch-form">
          <p>이미 계정이 있으신가요?</p>
          <button type="button" className="switch-button" onClick={onSwitchToLogin} disabled={loading}>
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;