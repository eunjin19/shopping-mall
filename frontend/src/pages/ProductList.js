import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProductList.css";

const ProductListPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState({});

  // 로그인된 사용자 ID (테스트용, 실제 로그인 연동 시 교체)
  const userId = 1;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/products");
        console.log("res", response.data);
        setList(response.data);
      } catch (error) {
        console.error("상품 데이터 로딩 오류:", error);
        alert("상품 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ 개선된 장바구니 담기 함수
  const addToCart = async (productId) => {
    // 개별 상품별 로딩 상태 관리
    setCartLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      // Cart.js와 통일된 API 엔드포인트 사용
      const response = await axios.post("http://localhost:5000/cart", {
        userId,
        productId,
        quantity: 1
      });
      
      // 성공 메시지 표시
      alert(response.data.message || "장바구니에 담겼습니다!");
      
      // 선택사항: 장바구니 카운트 업데이트 이벤트 발생
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { productId, quantity: 1, action: 'add' }
      }));
      
    } catch (error) {
      console.error("장바구니 추가 오류:", error);
    
      const status = error.response?.status;
    
      if (status === 400) {
        alert(error.response.data?.message || "잘못된 요청입니다.");
      } else if (status === 409) {
        alert("이미 장바구니에 있는 상품입니다. 수량이 추가되었습니다.");
      } else if (status === 404) {
        alert("상품을 찾을 수 없습니다.");
      } else {
        // 네트워크 오류 등 response가 없는 경우
        alert(error.response?.data?.message || error.message || "장바구니 추가에 실패했습니다.");
      }

    } finally {
      // 개별 상품별 로딩 상태 해제
      setCartLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  if (loading) {
    return (
      <div className="product-list">
        <h1>PRODUCT LIST</h1>
        <div className="product-grid">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="product-card loading-card"
              style={{ height: "300px" }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="product-list">
      <h1>PRODUCT LIST</h1>

      {list.length === 0 ? (
        <div className="no-data">상품이 없습니다.</div>
      ) : (
        <div className="product-grid">
          {list.map((item) => (
            <div key={item.id} className="product-card">
              <div className="product-image">
                {item.image ? (
                  <img src={`${item.image}`} alt={item.name} />
                ) : (
                  <div className="no-image">이미지 없음</div>
                )}
              </div>

              <div className="product-info">
                <div className="product-brand">{item.brand || "No Brand"}</div>
                <div className="product-name">{item.name}</div>
                <div className="product-description">{item.description}</div>
                <div className="product-price">{formatPrice(item.price)}</div>

                <div className="product-meta">
                  <span
                    className={`product-stock ${
                      item.stock <= 0 ? "out-of-stock" : ""
                    }`}
                  >
                    {item.stock > 0 ? `재고 ${item.stock}개` : "품절"}
                  </span>
                  <span className="product-date">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </div>

              {/* ✅ 개선된 장바구니 담기 버튼 */}
              <button
                className={`cart-button ${cartLoading[item.id] ? 'loading' : ''}`}
                onClick={() => addToCart(item.id)}
                disabled={item.stock <= 0 || cartLoading[item.id]}
              >
                {cartLoading[item.id] ? "담는 중..." : "장바구니 담기"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListPage;