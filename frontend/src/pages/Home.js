import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";   // ✅ 추가
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 배너 슬라이더 데이터
  const bannerSlides = [
    {
      id: 1,
      title: "신제품 출시",
      subtitle: "품격 있는 아름다움",
      description: "지금 최대 30% 할인",
      backgroundImage: "/1.jpg",
      className: ""
    },
    {
      id: 2,
      title: "프리미엄 스킨케어",
      subtitle: "자연에서 온 순수함",
      description: "새로운 세럼 라인 출시",
      backgroundImage: "/2.jpg",
      className: ""
    },
    {
      id: 3,
      title: "한정 에디션",
      subtitle: "특별한 순간을 위한",
      description: "독점 할인 혜택",
      backgroundImage: "/4.jpg",
      className: ""
    }
  ];

  useEffect(() => {
    loadProducts();

    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        const featured = products.filter(product => product.featured).slice(0, 6);
        setFeaturedProducts(featured);
      } else {
        // ✅ 데모 데이터
        const demoProducts = [
          { 
            id: 1, 
            name: 'SKWARE 세럼', 
            price: 45000, 
            image: '/placeholder.jpg',
            description: '집중 영양 세럼',
            featured: true,
            category: 'skincare'
          },
          { 
            id: 2, 
            name: 'SKWARE 크림', 
            price: 38000, 
            image: '/placeholder.jpg',
            description: '모이스처 크림',
            featured: true,
            category: 'skincare'
          },
          { 
            id: 3, 
            name: 'SKWARE 토너', 
            price: 32000, 
            image: '/placeholder.jpg',
            description: '하이드레이팅 토너',
            featured: true,
            category: 'skincare'
          }
        ];
        setFeaturedProducts(demoProducts);
        localStorage.setItem('products', JSON.stringify(demoProducts));
      }
    } catch (error) {
      console.error('상품 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home">
      {/* Hero 배너 슬라이더 섹션 */}
      <section className="hero-banner">
        <div className="banner-slider">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${slide.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="banner-overlay">
                <div className="banner-content">
                  <h1 className="banner-title">
                    {slide.title}
                    <br />
                    <span className="highlight">{slide.subtitle}</span>
                  </h1>
                  <p className="banner-subtitle">{slide.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 슬라이더 화살표 */}
        <button className="slider-arrow prev" onClick={prevSlide}>❮</button>
        <button className="slider-arrow next" onClick={nextSlide}>❯</button>
        
        {/* 슬라이더 네비게이션 점 */}
        <div className="slider-nav">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              className={`nav-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>
      
      {/* 인기 상품 섹션 */}
      <section className="featured-products">
        <div className="section-header">
          <h2>인기 상품</h2>
          <p>피부에 자연스러운 아름다움을 선사하는 프리미엄 제품들</p>
        </div>
        <div className="products-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>상품을 불러오는 중...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map(product => (
                <Link 
                  key={product.id} 
                  to={"/products"}   // ✅ 상세 페이지 이동
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>등록된 인기 상품이 없습니다.</p>
              <p>관리자 모드에서 상품을 등록해주세요.</p>
            </div>
          )}
        </div>
      </section>

      {/* 브랜드 스토리 섹션 */}
      <section className="brand-story">
        <div className="story-content">
          <h2>SKWARE의 약속</h2>
          <p>자연에서 온 순수한 성분으로 당신의 피부를 건강하고 아름답게</p>
          <div className="story-features">
            <div className="feature">
              <div className="feature-icon">🌿</div>
              <h3>자연 성분</h3>
              <p>엄선된 천연 원료</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🧪</div>
              <h3>과학적 연구</h3>
              <p>첨단 기술력</p>
            </div>
            <div className="feature">
              <div className="feature-icon">✨</div>
              <h3>검증된 효과</h3>
              <p>임상 테스트 완료</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
