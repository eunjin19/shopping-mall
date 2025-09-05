import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('회원정보');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    detailAddress: '',
    postalCode: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || '',
          phone: parsedUser.phone || '',
          email: parsedUser.email || '',
          address: parsedUser.address || '',
          detailAddress: parsedUser.detailAddress || '',
          postalCode: parsedUser.postalCode || ''
        });
      } else {
        navigate('/auth');
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // 사용자 정보 업데이트
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert('회원정보가 수정되었습니다.');
  };

  const menuItems = [
    { name: '회원정보', active: true },
    { name: '주문내역', active: false },
    { name: '배송조회', active: false },
    { name: '1:1문의', active: false },
  ];

  return (
    <div className="mypage">
      <div className="mypage-container">
        {/* 좌측 사이드바 */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>마이페이지</h2>
            <div className="user-welcome">
              <span className="user-name">{user?.name || user?.email}님</span>
              

            
            </div>
          </div>
          
          <nav className="sidebar-nav">
            {menuItems.map((item, index) => (
              <div 
                key={index} 
                className={`nav-item ${item.name === activeMenu ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.name)}
              >
                {item.name}
                {item.name === activeMenu && <span className="active-indicator"></span>}
              </div>
            ))}
          </nav>
          
          <button className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        {/* 우측 메인 컨텐츠 */}
        <div className="main-content">
          <div className="content-header">
            <h1>회원정보 수정</h1>
          </div>
          
          <div className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label>이름</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>휴대폰 번호</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="휴대폰 번호를 입력하세요"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>이메일</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="이메일을 입력하세요"
                />
              </div>
              
            </div>

            <div className="form-row">
              <div className="form-group full-width">
              </div>
            </div>

            <div className="password-section">
              <h3>비밀번호 변경하기</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>현재 비밀번호</label>
                  <input type="password" placeholder="현재 비밀번호를 입력하세요" />
                </div>
                <div className="form-group">
                  <label>신규 비밀번호</label>
                  <input type="password" placeholder="새 비밀번호를 입력하세요" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>신규 비밀번호 확인</label>
                  <input type="password" placeholder="새 비밀번호를 다시 입력하세요" />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-button">취소</button>
              <button type="button" className="save-button" onClick={handleSave}>
                개인정보 업데이트
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;