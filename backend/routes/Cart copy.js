import express from "express";
import { db } from "../index.js";

const router = express.Router();

// ✅ 범용 결과 처리 함수
const processQueryResult = (result) => {
  console.log('Raw query result:', result);
  console.log('Result type:', typeof result);
  console.log('Is array:', Array.isArray(result));
  
  // MySQL2 promise: [rows, fields]
  if (Array.isArray(result) && result.length >= 2 && Array.isArray(result[0])) {
    console.log('MySQL2 promise format detected');
    return result[0];
  }
  
  // MySQL with promisify 또는 직접 결과
  if (Array.isArray(result)) {
    console.log('Direct array result detected');
    return result;
  }
  
  // 기타 형태
  console.log('Unknown result format, returning as-is');
  return result;
};

router.post("/", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  // 입력 값 검증
  if (!userId || !productId || !quantity) {
    return res.status(400).json({ 
      message: "필수 정보가 누락되었습니다. (userId, productId, quantity)" 
    });
  }

  if (quantity <= 0) {
    return res.status(400).json({ 
      message: "수량은 1개 이상이어야 합니다." 
    });
  }

  try {
    console.log(`=== 디버깅 정보 ===`);
    console.log(`요청 데이터:`, { userId, productId, quantity });
    console.log(`productId 타입:`, typeof productId);
    console.log(`productId 값:`, productId);
    
    // ✅ 1단계: 전체 상품 목록 확인 (디버깅용)
    console.log('\n=== 1단계: 전체 상품 목록 조회 ===');
    const allProductsResult = await db.query("SELECT id, name FROM products LIMIT 5");
    const allProducts = processQueryResult(allProductsResult);
    console.log(`전체 상품 목록:`, allProducts);
    
    // ✅ 2단계: 특정 상품 조회
    console.log('\n=== 2단계: 특정 상품 조회 ===');
    console.log(`조회 쿼리: SELECT * FROM products WHERE id = ${productId}`);
    
    const productResult = await db.query("SELECT * FROM products WHERE id = ?", [productId]);
    const products = processQueryResult(productResult);
    
    console.log(`특정 상품 조회 결과:`, products);
    console.log(`결과 타입:`, typeof products);
    console.log(`결과 길이:`, products ? products.length : 'null/undefined');
    
    // 상품이 존재하지 않는 경우
    if (!products || products.length === 0) {
      console.log(`❌ 상품을 찾을 수 없음 - productId: ${productId}`);
      
      // 추가 디버깅: 실제 DB에 있는 상품 ID들 확인
      const existingIds = await db.query("SELECT id FROM products ORDER BY id");
      const ids = processQueryResult(existingIds);
      console.log('실제 존재하는 상품 ID들:', ids.map(item => item.id));
      
      return res.status(404).json({ 
        message: "상품을 찾을 수 없습니다.",
        requestedProductId: productId,
        existingProductIds: ids.map(item => item.id)
      });
    }

    const product = products[0];
    console.log(`✅ 상품 찾음:`, product);
    
    // 재고 확인
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `재고가 부족합니다. (현재 재고: ${product.stock}개)` 
      });
    }

    // ✅ 3단계: 장바구니 기존 항목 조회
    console.log('\n=== 3단계: 장바구니 기존 항목 조회 ===');
    const cartResult = await db.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );
    
    const cartItems = processQueryResult(cartResult);
    console.log(`장바구니 조회 결과:`, cartItems);

    // 기존 항목이 있는 경우 수량 업데이트
    if (cartItems && cartItems.length > 0) {
      const newQuantity = cartItems[0].quantity + quantity;
      
      // 새로운 수량이 재고를 초과하는지 확인
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          message: `총 수량이 재고를 초과합니다. (현재 장바구니: ${cartItems[0].quantity}개, 재고: ${product.stock}개)` 
        });
      }
      
      await db.query(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity, userId, productId]
      );
      
      console.log(`✅ 장바구니 수량 업데이트 완료 - 새 수량: ${newQuantity}`);
      return res.status(200).json({ 
        message: `장바구니에 상품이 추가되었습니다! (총 ${newQuantity}개)`,
        action: "updated"
      });
    }

    // ✅ 4단계: 새로운 항목 추가
    console.log('\n=== 4단계: 새 장바구니 항목 추가 ===');
    await db.query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [userId, productId, quantity]
    );

    console.log(`✅ 장바구니 추가 완료`);
    res.status(201).json({ 
      message: "장바구니에 담겼습니다!",
      action: "added"
    });

  } catch (err) {
    console.error("\n❌ 장바구니 추가 중 오류:", err);
    console.error("에러 코드:", err.code);
    console.error("에러 메시지:", err.message);
    console.error("SQL State:", err.sqlState);
    console.error("SQL Message:", err.sqlMessage);
    
    // 데이터베이스 연결 오류
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: "데이터베이스 연결에 실패했습니다." 
      });
    }
    
    // 외래 키 제약 조건 오류
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ 
        message: "존재하지 않는 사용자이거나 상품입니다.",
        details: "외래 키 제약 조건 위반"
      });
    }
    
    // 테이블이 존재하지 않음
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        message: "데이터베이스 테이블이 존재하지 않습니다.",
        table: err.sqlMessage
      });
    }
    
    // 기타 데이터베이스 오류
    if (err.code && err.code.startsWith('ER_')) {
      return res.status(400).json({ 
        message: "데이터베이스 오류가 발생했습니다.",
        error: err.code,
        details: process.env.NODE_ENV === 'development' ? err.sqlMessage : undefined
      });
    }
    
    res.status(500).json({ 
      message: "서버 오류가 발생했습니다.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ✅ 디버깅용: 장바구니 조회 라우트
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await db.query(
      `SELECT c.*, p.name, p.price, p.stock 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [userId]
    );
    
    const cartItems = processQueryResult(result);
    res.json(cartItems || []);
  } catch (err) {
    console.error("장바구니 조회 오류:", err);
    res.status(500).json({ message: "장바구니 조회에 실패했습니다." });
  }
});

// ✅ 디버깅용: 상품 목록 조회 라우트
router.get("/debug/products", async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, price, stock FROM products");
    const products = processQueryResult(result);
    res.json({
      count: products.length,
      products: products
    });
  } catch (err) {
    console.error("상품 조회 오류:", err);
    res.status(500).json({ message: "상품 조회에 실패했습니다." });
  }
});

export default router;