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

  // ✅ 이미지 URL 생성 함수
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // 절대 URL인 경우 그대로 사용
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // 상대 경로인 경우 서버 주소와 결합
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `http://localhost:5000/images/${cleanPath}`;
  };

  return (
    <div className="cart-container">
      <h2>장바구니</h2>

      {loading ? (
        <div className="loading">불러오는 중...</div>
      ) : cart.length === 0 ? (
        <div className="empty-cart">장바구니가 비어 있습니다.</div>
      ) : (
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
                        src={`${item.image}`} 
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
      )}
    </div>
  );
}

export default Cart;