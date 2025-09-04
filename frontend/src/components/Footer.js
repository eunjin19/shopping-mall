import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-enhanced">
  <div className="container">
    <div className="footer-content">
      <div className="footer-section">
        <h3>브랜드 정보</h3>
        <p>Blank.는 최고 품질의 화장품을 제공합니다.</p>
      </div>
      <div className="footer-section">
        <h3>고객 서비스</h3>
        <ul>
          <li><a href="/support">고객센터</a></li>
          <li><a href="/faq">자주 묻는 질문</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <p>&copy; 2025 쇼핑몰. All rights reserved.</p>
    </div>
  </div>
</footer>
  );
};

export default Footer;