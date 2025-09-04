import React, { useEffect, useState } from 'react';
import { getUserInfo, getOrderHistory } from '../utils/api';
import axios from 'axios';
import './MyPage.css';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.userId;

        const user = await getUserInfo(userId, token);
        const orderHistory = await getOrderHistory(userId, token);

        setUserInfo(user);
        setOrders(orderHistory);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleRegister = async () => {
    try {
      const res = await axios.post('/auth/register', { username, email, password });
      alert(res.data.message);
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      alert(err.response?.data?.message || '회원가입 실패');
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('/auth/login', { username: loginUsername, password: loginPassword });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUserInfo(user);
      setLoginUsername('');
      setLoginPassword('');
    } catch (err) {
      alert(err.response?.data?.message || '로그인 실패');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUserInfo(null);
    setOrders([]);
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.userId;

      await axios.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('계정이 삭제되었습니다.');
      handleLogout();
    } catch (err) {
      alert(err.response?.data?.message || '계정 삭제 실패');
    }
  };

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="mypage-container">
      <h2>마이페이지</h2>

      {!token ? (
        <div className="section">
          <h3>회원가입</h3>
          <div className="input-group">
            <input placeholder="사용자명" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="button-group">
            <button onClick={handleRegister}>회원가입</button>
          </div>

          <h3>로그인</h3>
          <div className="input-group">
            <input placeholder="사용자명" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
            <input type="password" placeholder="비밀번호" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
          </div>
          <div className="button-group">
            <button onClick={handleLogin}>로그인</button>
          </div>
        </div>
      ) : (
        <div className="section">
          <div className="button-group">
            <button onClick={handleLogout}>로그아웃</button>
            <button onClick={handleDeleteAccount}>회원 탈퇴</button>
          </div>

          <div className="user-info">
            <p>이름: {userInfo.name || userInfo.username}</p>
            <p>이메일: {userInfo.email}</p>
          </div>

          <h3>주문 내역</h3>
          <ul className="order-list">
            {orders.length === 0 ? (
              <p>주문 내역이 없습니다.</p>
            ) : (
              orders.map((order) => (
                <li key={order.id}>
                  주문번호: {order.id} - 총액: {order.total}원
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyPage;
