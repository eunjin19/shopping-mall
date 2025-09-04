import express from 'express';
import { db } from '../index.js';

const router = express.Router();

// 장바구니 조회
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('장바구니 조회 오류:', err);
      return res.status(500).json({ success: false, message: '장바구니를 불러오는데 실패했습니다.' });
    }
    res.json({ success: true, data: results });
  });
});

// 장바구니에 상품 추가
router.post('/', (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;
  
  // 이미 있는 상품인지 확인
  const checkQuery = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';
  
  db.query(checkQuery, [userId, productId], (err, results) => {
    if (err) {
      console.error('장바구니 확인 오류:', err);
      return res.status(500).json({ success: false, message: '장바구니 추가에 실패했습니다.' });
    }
    
    if (results.length > 0) {
      // 이미 있으면 수량 업데이트
      const updateQuery = 'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
      db.query(updateQuery, [quantity, userId, productId], (err) => {
        if (err) {
          console.error('장바구니 수량 업데이트 오류:', err);
          return res.status(500).json({ success: false, message: '장바구니 업데이트에 실패했습니다.' });
        }
        res.json({ success: true, message: '장바구니에 추가되었습니다.' });
      });
    } else {
      // 새로 추가
      const insertQuery = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
      db.query(insertQuery, [userId, productId, quantity], (err) => {
        if (err) {
          console.error('장바구니 추가 오류:', err);
          return res.status(500).json({ success: false, message: '장바구니 추가에 실패했습니다.' });
        }
        res.json({ success: true, message: '장바구니에 추가되었습니다.' });
      });
    }
  });
});

export default router;