// routes/cart.js
import express from "express";
import { db } from "../index.js"; // index.js에서 export한 DB 연결

const router = express.Router();

/* ------------------------ 장바구니 API ------------------------ */

// ✅ 장바구니 추가
router.post("/", (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
  }
  if (quantity <= 0) {
    return res.status(400).json({ message: "수량은 1개 이상이어야 합니다." });
  }

  const productQuery = "SELECT * FROM products WHERE id = ?";
  db.query(productQuery, [productId], (err, productResult) => {
    if (err) return res.status(500).json({ message: "서버 오류" });

    if (!productResult || productResult.length === 0) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    const product = productResult[0];
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ message: `재고가 부족합니다. (재고: ${product.stock})` });
    }

    const cartQuery = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
    db.query(cartQuery, [userId, productId], (err, cartResult) => {
      if (err) return res.status(500).json({ message: "서버 오류" });

      if (cartResult && cartResult.length > 0) {
        const newQuantity = cartResult[0].quantity + quantity;

        if (newQuantity > product.stock) {
          return res.status(400).json({
            message: `재고 초과 (현재 장바구니: ${cartResult[0].quantity}, 재고: ${product.stock})`,
          });
        }

        const updateQuery =
          "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?";
        db.query(updateQuery, [quantity, userId, productId], (err) => {
          if (err) return res.status(500).json({ message: "서버 오류" });
          res.json({ message: "✅ 장바구니 수량이 업데이트되었습니다." });
        });
      } else {
        const insertQuery =
          "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
        db.query(insertQuery, [userId, productId, quantity], (err) => {
          if (err) return res.status(500).json({ message: "서버 오류" });
          res.json({ message: "✅ 장바구니에 추가되었습니다." });
        });
      }
    });
  });
});

// ✅ 장바구니 조회
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const query = `SELECT c.*, p.name, p.price, p.stock , p.image
                 FROM cart c 
                 JOIN products p ON c.product_id = p.id 
                 WHERE c.user_id = ?`;
  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "장바구니 조회 오류" });
    res.json(result || []);
  });
});

// ✅ 수량 변경
router.patch("/:userId/:productId", (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).json({ message: "수량은 1개 이상이어야 합니다." });
  }

  const query =
    "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?";
  db.query(query, [quantity, userId, productId], (err) => {
    if (err) return res.status(500).json({ message: "서버 오류" });
    res.json({ message: "✅ 수량이 변경되었습니다.", quantity });
  });
});

// ✅ 상품 삭제
router.delete("/:userId/:productId", (req, res) => {
  const { userId, productId } = req.params;
  const query = "DELETE FROM cart WHERE user_id = ? AND product_id = ?";
  db.query(query, [userId, productId], (err) => {
    if (err) return res.status(500).json({ message: "서버 오류" });
    res.json({ message: "🗑️ 상품이 장바구니에서 삭제되었습니다." });
  });
});

export default router;
