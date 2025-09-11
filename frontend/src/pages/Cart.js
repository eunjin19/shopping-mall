// Cart.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Cart.css";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      alert("로그인 후 이용해주세요.");
      navigate("/auth");
      return;
    }
    fetchCart();
  }, [userId]);

  // ✅ 장바구니 불러오기
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/cart/${userId}`);
      setCart(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("장바구니 조회 오류:", error);
      alert("장바구니 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 수량 변경
  const updateQuantity = async (productId, newQuantity) => {
    try {
      await axios.patch(`http://localhost:5000/cart/${userId}/${productId}`, {
        quantity: newQuantity,
      });
      fetchCart();
    } catch (error) {
      console.error("수량 변경 오류:", error);
      alert("수량 변경에 실패했습니다.");
    }
  };

  // ✅ 상품 삭제
  const removeItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/cart/${userId}/${productId}`);
      fetchCart();
    } catch (error) {
      console.error("상품 삭제 오류:", error);
      alert("상품 삭제에 실패했습니다.");
    }
  };

  // ✅ 전체 상품 합계 계산
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // ✅ 주문하기 기능
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("장바구니에 상품이 없습니다.");
      return;
    }

    try {
      // 모든 장바구니 상품을 삭제 (주문 완료 처리)
      for (const item of cart) {
        await axios.delete(`http://localhost:5000/cart/${userId}/${item.product_id}`);
      }
      
      alert("주문이 완료되었습니다!");
      setCart([]); // 로컬 상태도 초기화
    } catch (error) {
      console.error("주문 처리 오류:", error);
      alert("주문 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="cart-container">
      <h2>장바구니</h2>

      {loading ? (
        <div className="loading">불러오는 중...</div>
      ) : cart.length === 0 ? (
        <div className="empty-cart">장바구니가 비어 있습니다.</div>
      ) : (
        <div className="cart-main-content">
          <div className="cart-table-wrapper">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>상품정보</th>
                  <th>옵션</th>
                  <th>수량</th>
                  <th>주문금액</th>
                  <th>배송비</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.product_id}>
                    <td className="product-info" data-label="상품정보">
                      <div className="product-image">
                        {item.image ? (
                          <img 
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <div className="no-image">이미지 없음</div>
                        )}
                      </div>
                      <div className="product-details">
                        <h4>{item.name}</h4>
                        <p>상품코드: {item.product_id}</p>
                      </div>
                    </td>
                    <td data-label="옵션">기본옵션</td>
                    <td data-label="수량">
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(item.product_id, item.quantity - 1)
                              : removeItem(item.product_id)
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="total-price" data-label="주문금액">
                      {(item.price * item.quantity).toLocaleString()}원
                    </td>
                    <td data-label="배송비">무료배송</td>
                    <td data-label="선택">
                      <button
                        className="delete-btn"
                        onClick={() => removeItem(item.product_id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 주문 요약 및 결제 영역 */}
          <div className="cart-summary">
            <div className="summary-content">
              <div className="total-section">
                <div className="total-info">
                  <span className="total-label">총 상품 개수:</span>
                  <span className="total-value">
                    {cart.reduce((total, item) => total + item.quantity, 0)}개
                  </span>
                </div>
                <div className="total-info">
                  <span className="total-label">총 상품 금액:</span>
                  <span className="total-value">
                    {getTotalPrice().toLocaleString()}원
                  </span>
                </div>
                <div className="total-info">
                  <span className="total-label">배송비:</span>
                  <span className="total-value">무료</span>
                </div>
                <div className="final-total">
                  <span className="final-label">결제 예정 금액:</span>
                  <span className="final-price">
                    {getTotalPrice().toLocaleString()}원
                  </span>
                </div>
              </div>
              <button className="order-btn" onClick={handleOrder}>
                주문하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
