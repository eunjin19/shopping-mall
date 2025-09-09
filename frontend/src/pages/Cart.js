import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Cart.css";

function Cart({ userId }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) fetchCart();
  }, [userId]);

  // 장바구니 불러오기
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/cart/${userId}`);
      console.log("서버 응답:", response.data);
      setCart(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("장바구니 조회 오류:", error);
      alert("장바구니 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 수량 증가 (백엔드에서 기존 수량에 추가하는 방식)
  const increaseQuantity = async (productId) => {
    try {
      const response = await axios.post("http://localhost:5000/cart/insert", {
        userId,
        productId,
        quantity: 1, // 1개 추가
      });
      
      if (response.data.message) {
        console.log(response.data.message);
      }
      fetchCart(); // 장바구니 새로고침
    } catch (error) {
      console.error("수량 증가 오류:", error);
      alert(error.response?.data?.message || "수량 변경에 실패했습니다.");
    }
  };

  // 수량 감소 - 백엔드에서 음수를 지원하지 않으므로 별도 DELETE API가 필요
  // 현재는 직접 DB 조작이 필요하거나 별도 DELETE 엔드포인트 구현 필요
  const decreaseQuantity = async (productId, currentQuantity) => {
    if (currentQuantity <= 1) {
      alert("수량이 1개 이하입니다. 삭제를 원하시면 삭제 버튼을 사용해주세요.");
      return;
    }
    
    // 현재 백엔드에서는 음수 quantity를 지원하지 않음
    // 실제로는 별도의 UPDATE 또는 DELETE API 엔드포인트가 필요
    alert("수량 감소 기능은 현재 백엔드에서 지원되지 않습니다. 별도 API 구현이 필요합니다.");
  };

  // 항목 삭제 - 현재 백엔드에서는 DELETE 엔드포인트가 없음
  const deleteItem = async (productId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
    // 현재 백엔드에서는 DELETE 엔드포인트가 구현되지 않음
    // 별도 DELETE API 엔드포인트 구현 필요
    alert("삭제 기능은 현재 백엔드에서 지원되지 않습니다. 별도 DELETE API 구현이 필요합니다.");
  };

  // 총 금액 계산
  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // 가격 포맷팅
  const formatPrice = (price) =>
    new Intl.NumberFormat("ko-KR").format(price);

  if (loading) {
    return (
      <div className="cart-container">
        <h2>장바구니</h2>
        <div>장바구니를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>장바구니</h2>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>장바구니가 비어있습니다.</p>
          <button onClick={() => (window.location.href = "/products")}>
            쇼핑 계속하기
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.product_id} className="cart-item">
                {/* 이미지 */}
                <div className="item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="no-image">이미지 없음</div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="item-info">
                  <h4>{item.name}</h4>
                  {item.brand && <p className="brand">{item.brand}</p>}
                  <p className="price">단가: {formatPrice(item.price)}원</p>
                  <p className="subtotal">
                    소계: {formatPrice(item.price * item.quantity)}원
                  </p>
                  <p className="stock-info">재고: {item.stock}개</p>
                </div>

                {/* 수량 조절 */}
                <div className="quantity-controls">
                  <button
                    className="qty-btn decrease"
                    onClick={() =>
                      decreaseQuantity(item.product_id, item.quantity)
                    }
                    disabled={item.quantity <= 1}
                    title="현재 백엔드에서 지원되지 않는 기능입니다"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    className="qty-btn increase"
                    onClick={() => increaseQuantity(item.product_id)}
                    disabled={item.quantity >= item.stock}
                    title={item.quantity >= item.stock ? "재고가 부족합니다" : "수량 증가"}
                  >
                    +
                  </button>
                </div>

                {/* 삭제 */}
                <button
                  className="delete-btn"
                  onClick={() => deleteItem(item.product_id)}
                  title="현재 백엔드에서 지원되지 않는 기능입니다"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          {/* 합계 영역 */}
          <div className="cart-summary">
            <div className="total-info">
              <h3>총 상품 수: {cart.length}개</h3>
              <h3>총 수량: {cart.reduce((total, item) => total + item.quantity, 0)}개</h3>
              <h3>총 금액: {formatPrice(getTotalPrice())}원</h3>
            </div>
            <div className="cart-actions">
              <button
                className="continue-shopping"
                onClick={() => (window.location.href = "/products")}
              >
                쇼핑 계속하기
              </button>
              <button className="checkout-btn">주문하기</button>
            </div>
          </div>

          {/* 디버깅 정보 (개발 환경에서만 표시) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="additional-debug" style={{marginTop: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '5px'}}>
              <h4>🔧 추가 디버깅 정보</h4>
              <p>환경: {process.env.NODE_ENV || 'development'}</p>
              <p>현재 시각: {new Date().toLocaleString()}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Cart;