import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMyPageClick = (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      // 로그인 안된 상태 - AuthPage로 이동
      navigate('/auth');
    } else {
      // 로그인된 상태 - MyPage로 이동
      navigate('/mypage');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* 브랜드 로고 */}
          <div className="navbar-brand">
            <Link to="/">Blank.</Link>
          </div>
          
          {/* 중앙 검색창 */}
          <div className="navbar-search">
            <form className="search-form">
              <input
                type="text"
                name="search"
                placeholder="검색어를 입력하세요"
                className="search-input"
              />
              <button type="submit" className="search-submit-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </form>
          </div>
          
          {/* 우측 아이콘들 */}
          <div className="navbar-actions">
            <Link to="/cart" className="navbar-icon-btn cart-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </Link>
            <a href="/mypage" onClick={handleMyPageClick} className="navbar-icon-btn user-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </a>
          </div>
          
          {/* 모바일 햄버거 버튼 */}
          <button className="navbar-mobile-btn" onClick={toggleMobileMenu}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* 데스크톱 메뉴 (검색창 아래) */}
        <div className="navbar-menu">
          <Link to="/" className="navbar-menu-item">HOME</Link>
          <Link to="/products" className="navbar-menu-item">PRODUCT</Link>
        </div>
        
        {/* 모바일 메뉴 */}
        <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-mobile-item" onClick={() => setMobileMenuOpen(false)}>홈</Link>
          <Link to="/products" className="navbar-mobile-item" onClick={() => setMobileMenuOpen(false)}>상품</Link>
          
          <a href="/mypage" onClick={(e) => { handleMyPageClick(e); setMobileMenuOpen(false); }} className="navbar-mobile-item">마이페이지</a>
        </div>
      </div>
    </nav>
  );
};

export default Header;