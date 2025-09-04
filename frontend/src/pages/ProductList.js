import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // 상세페이지 이동용
import { getProducts } from "../utils/api"; // API 호출 함수
import axios from "axios";
import "./ProductList.css"; // CSS 파일 임포트

const ProductListPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/products");
        console.log("res", response.data);
        setList(response.data);
        console.log("list", response.data);
      } catch (error) {
        console.error("상품 데이터 로딩 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // [] 두번째 매개변수를 통해 최초 한번만 가져오도록 함

  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="product-list">
        <h1>상품 목록</h1>
        <div className="product-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="product-card loading-card" style={{height: '300px'}}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="product-list">
      <h1>상품 목록</h1>
      
      {list.length === 0 ? (
        <div className="no-data">
          상품이 없습니다.
        </div>
      ) : (
        <div className="product-grid">
          {list.map((item) => (
            <div key={item.id} className="product-card">
              <div className="product-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="no-image">이미지 없음</div>
                )}
              </div>
              
              <div className="product-info">
                <div className="product-brand">{item.brand || 'No Brand'}</div>
                <div className="product-name">{item.name}</div>
                <div className="product-description">{item.description}</div>
                <div className="product-price">{formatPrice(item.price)}</div>
                
                <div className="product-meta">
                  <span className={`product-stock ${item.stock <= 0 ? 'out-of-stock' : ''}`}>
                    {item.stock > 0 ? `재고 ${item.stock}개` : '품절'}
                  </span>
                  <span className="product-date">{formatDate(item.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ProductListPage;