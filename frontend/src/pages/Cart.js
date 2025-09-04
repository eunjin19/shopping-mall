import React, { useEffect, useState } from 'react';
import { getCartItems, addToCart } from '../utils/api';

const Cart = ({ userId }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const items = await getCartItems(userId);
        setCartItems(items);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId]);

  const handleAdd = async (productId) => {
    try {
      await addToCart(userId, productId);
      const items = await getCartItems(userId);
      setCartItems(items);
    } catch (error) {
      console.error(error.message);
    }
  };


  return (
    <div>
      <h2>장바구니</h2>
      {cartItems.length === 0 ? (
        <p>장바구니가 비어있습니다.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.id}>
              {item.name} - 수량: {item.quantity}
              <button onClick={() => handleAdd(item.id)}>+1</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
