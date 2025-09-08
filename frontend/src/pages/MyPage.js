// src/pages/MyPage.js
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

  // 비밀번호 변경 관련 상태
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwVerified, setPwVerified] = useState(false);
  const [pwErr, setPwErr] = useState({ current: '', next: '', confirm: '' });
  const [pwOk, setPwOk] = useState('');
  const [checking, setChecking] = useState(false);

  const navigate = useNavigate();

  // 로그인 상태 확인
  useEffect(() => {
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

    checkLoginStatus();
  }, [navigate]);

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

  // 현재 비밀번호 검증
  const verifyCurrentPassword = async (silent = false) => {
    if (!pw.current) {
      setPwVerified(false);
      setPwErr(prev => ({ ...prev, current: '현재 비밀번호를 입력해주세요.' }));
      return false;
    }

    setChecking(true);
    setPwOk('');
    try {
      const res = await fetch("http://localhost:5000/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, currentPassword: pw.current }),
      });

      if (res.ok) {
        const data = await res.json();
        const valid = !!(data?.valid || data?.success || data?.isValid);
        if (valid) {
          setPwVerified(true);
          setPwErr(prev => ({ ...prev, current: '' }));
          return true;
        } else {
          setPwVerified(false);
          setPwErr(prev => ({ ...prev, current: '현재 비밀번호가 일치하지 않습니다.' }));
          return false;
        }
      } else {
        console.warn('verify-password returned non-OK:', res.status);
      }
    } catch (e) {
      console.warn('verify-password fetch failed, fallback to local check', e);
    } finally {
      setChecking(false);
    }

    // === fallback: localStorage 확인 ===
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const localUser = JSON.parse(userStr);
        if (localUser?.password && pw.current === localUser.password) {
          setPwVerified(true);
          setPwErr(prev => ({ ...prev, current: '' }));
          return true;
        } else {
          setPwVerified(false);
          if (!silent) setPwErr(prev => ({ ...prev, current: '현재 비밀번호가 일치하지 않습니다.' }));
          return false;
        }
      } else {
        setPwVerified(false);
        if (!silent) setPwErr(prev => ({ ...prev, current: '비밀번호 확인을 위한 서버가 응답하지 않습니다.' }));
        return false;
      }
    } catch (e) {
      console.error('로컬 검증 중 오류', e);
      setPwVerified(false);
      if (!silent) setPwErr(prev => ({ ...prev, current: '비밀번호 확인 중 오류가 발생했습니다.' }));
      return false;
    }
  };

  const onPwFieldChange = (e) => {
    const { name, value } = e.target;
    setPwOk('');
    setPw(prev => ({ ...prev, [name]: value }));
    setPwErr(prev => ({ ...prev, [name]: '' }));
    if (name === 'current') setPwVerified(false);
  };

  // 새 비밀번호 클라이언트 검증
  const validateNewPasswords = () => {
    let ok = true;
    const nextErr = { current: '', next: '', confirm: '' };

    if (!pw.next || pw.next.length < 8) {
      nextErr.next = '새 비밀번호는 8자 이상이어야 합니다.';
      ok = false;
    }
    if (pw.next && pw.current && pw.next === pw.current) {
      nextErr.next = '현재 비밀번호와 다른 비밀번호를 사용해주세요.';
      ok = false;
    }
    if (!pw.confirm || pw.confirm !== pw.next) {
      nextErr.confirm = '비밀번호 확인이 일치하지 않습니다.';
      ok = false;
    }

    setPwErr(nextErr);
    return ok;
  };

  // 서버로 비밀번호 변경
  const handleChangePassword = async () => {
    setPwOk('');
    if (!validateNewPasswords()) return false;

    try {
      const res = await fetch("http://localhost:5000/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user?.username,
          email: user?.email,
          currentPassword: pw.current,
          newPassword: pw.next,
        }),
      });
      
      const data = await res.json();
      console.log(data); // 여기서 success:true 나 message 확인
      

      if (res.ok && data.success) {
        setPwOk(data.message); // "비밀번호가 성공적으로 변경되었습니다."
        setPw({ current: '', next: '', confirm: '' });
        setPwVerified(false);
        return true;
      } else {
        setPwErr(prev => ({
          ...prev,
          confirm: data.message || "비밀번호 변경 실패",
        }));
        return false;
      }
    } catch (e) {
      console.error(e);
      setPwErr(prev => ({
        ...prev,
        confirm: "비밀번호 변경 중 오류가 발생했습니다.",
      }));
      return false;
    }
  };

  // 개인정보 저장 + 비밀번호 변경 포함
  const handleSave = async () => {
    if (pw.next) {
      const okVerify = await verifyCurrentPassword(true);
      if (!okVerify) return;
      const changed = await handleChangePassword();
      if (!changed) return;
    }

    try {
      const updatedUser = { ...user, ...formData };
      const local = JSON.parse(localStorage.getItem('user') || '{}');
      if (local?.password && !updatedUser.password) {
        updatedUser.password = local.password;
      }
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setPwErr({ current: '', next: '', confirm: '' });
      setPwOk(prev => prev || '회원정보가 업데이트되었습니다.');
      alert('회원정보가 수정되었습니다.');
    } catch (e) {
      console.error('프로필 저장 중 오류', e);
      alert('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  const menuItems = [
    { name: '회원정보', active: true },
    { name: '주문내역', active: false },
    { name: '배송조회', active: false },
    { name: '1:1문의', active: false },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="mypage">
      {/* 좌측 사이드바 */}
      <div className="mypage-sidebar">
        <div className="sidebar-header">
          <h2>마이페이지</h2>
          <div className="user-welcome">
            <span className="user-name">{user?.username || user?.email}님</span>
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

      {/* 우측 메인 */}
      <div className="mypage-content">
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

          {/* 비밀번호 변경 */}
          <div className="password-section">
            <h3>비밀번호 변경하기</h3>

            <div className="form-row">
              <div className="form-group">
                <label>현재 비밀번호</label>
                <input
                  type="password"
                  name="current"
                  value={pw.current}
                  onChange={onPwFieldChange}
                  onBlur={() => verifyCurrentPassword(true)}
                  placeholder="현재 비밀번호를 입력하세요"
                  aria-invalid={!!pwErr.current}
                />
                {checking && <small className="info-text">확인 중...</small>}
                {pwErr.current && <small className="error-text">{pwErr.current}</small>}
                {pwVerified && !pwErr.current && <small className="success-text">현재 비밀번호 확인 완료</small>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>신규 비밀번호</label>
                <input
                  type="password"
                  name="next"
                  value={pw.next}
                  onChange={onPwFieldChange}
                  placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                  aria-invalid={!!pwErr.next}
                />
                {pwErr.next && <small className="error-text">{pwErr.next}</small>}
              </div>

              <div className="form-group">
                <label>신규 비밀번호 확인</label>
                <input
                  type="password"
                  name="confirm"
                  value={pw.confirm}
                  onChange={onPwFieldChange}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  aria-invalid={!!pwErr.confirm}
                />
                {pwErr.confirm && <small className="error-text">{pwErr.confirm}</small>}
                {pwOk && <small className="success-text">{pwOk}</small>}
              </div>
            </div>

            <p className="hint-text">비밀번호를 변경하려면 위 항목을 채운 뒤 '개인정보 업데이트' 버튼을 눌러주세요.</p>
          </div>

          {/* 개인정보 저장 */}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => {
              if (user) {
                setFormData({
                  name: user.name || '',
                  phone: user.phone || '',
                  email: user.email || '',
                  address: user.address || '',
                  detailAddress: user.detailAddress || '',
                  postalCode: user.postalCode || ''
                });
              }
              setPw({ current: '', next: '', confirm: '' });
              setPwVerified(false);
              setPwErr({ current: '', next: '', confirm: '' });
              setPwOk('');
            }}>취소</button>

            <button type="button" className="save-button" onClick={handleSave}>
              개인정보 업데이트
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
