import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import authRouter from "./routes/auth.js";


dotenv.config();

const app = express();

// __dirname 대체 코드
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 미들웨어
app.use(cors());
app.use(express.json());



// images 폴더가 없으면 생성
const imagesDir = path.join(__dirname, "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 정적 파일 제공 (이미지 접근용)
app.use("/images", express.static(path.join(__dirname, "images")));


// MySQL 연결 (callback 방식으로 export용 설정)
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("❌ DB 연결 실패:", err);
    process.exit(1);
  }
  console.log("✅ DB 연결 성공");
});

// ✅ Cart 라우터에서 사용할 수 있도록 db export
export const db = connection;

// ✅ Cart 라우터 등록 (인라인으로 직접 구현)
app.post("/cart", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  console.log(`=== 장바구니 추가 요청 ===`);
  console.log(`요청 데이터:`, { userId, productId, quantity });

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

  // 상품 존재 확인
  const productQuery = "SELECT * FROM products WHERE id = ?";
  connection.query(productQuery, [productId], (err, productResult) => {
    if (err) {
      console.error("상품 조회 오류:", err);
      return res.status(500).json({ message: "서버 오류" });
    }

    console.log(`상품 조회 결과:`, productResult);

    if (!productResult || productResult.length === 0) {
      console.log(`상품을 찾을 수 없음 - productId: ${productId}`);
      return res.status(404).json({ 
        message: "상품을 찾을 수 없습니다.",
        productId: productId 
      });
    }

    const product = productResult[0];

    // 재고 확인
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `재고가 부족합니다. (현재 재고: ${product.stock}개)` 
      });
    }

    // 기존 장바구니 항목 확인
    const cartQuery = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
    connection.query(cartQuery, [userId, productId], (err, cartResult) => {
      if (err) {
        console.error("장바구니 조회 오류:", err);
        return res.status(500).json({ message: "서버 오류" });
      }

      console.log(`장바구니 조회 결과:`, cartResult);

      if (cartResult && cartResult.length > 0) {
        // 기존 항목 업데이트
        const newQuantity = cartResult[0].quantity + quantity;
        
        if (newQuantity > product.stock) {
          return res.status(400).json({ 
            message: `총 수량이 재고를 초과합니다. (현재 장바구니: ${cartResult[0].quantity}개, 재고: ${product.stock}개)` 
          });
        }

        const updateQuery = "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?";
        connection.query(updateQuery, [quantity, userId, productId], (err) => {
          if (err) {
            console.error("장바구니 업데이트 오류:", err);
            return res.status(500).json({ message: "서버 오류" });
          }
          
          console.log(`✅ 장바구니 수량 업데이트 완료`);
          res.json({ 
            message: `장바구니에 상품이 추가되었습니다! (총 ${newQuantity}개)`,
            action: "updated"
          });
        });
      } else {
        // 새 항목 추가
        const insertQuery = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
        connection.query(insertQuery, [userId, productId, quantity], (err) => {
          if (err) {
            console.error("장바구니 추가 오류:", err);
            
            // 외래 키 제약 조건 오류 처리
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(404).json({ 
                message: "존재하지 않는 사용자이거나 상품입니다."
              });
            }
            
            return res.status(500).json({ message: "서버 오류" });
          }
          
          console.log(`✅ 장바구니 추가 완료`);
          res.json({ 
            message: "장바구니에 담겼습니다!",
            action: "added"
          });
        });
      }
    });
  });
});

// ✅ 장바구니 조회 라우트 (디버깅용)
app.get("/cart/:userId", (req, res) => {
  const { userId } = req.params;
  
  const query = `SELECT c.*, p.name, p.price, p.stock 
                 FROM cart c 
                 JOIN products p ON c.product_id = p.id 
                 WHERE c.user_id = ?`;
  
  connection.query(query, [userId], (err, result) => {
    if (err) {
      console.error("장바구니 조회 오류:", err);
      return res.status(500).json({ message: "장바구니 조회에 실패했습니다." });
    }
    res.json(result || []);
  });
});

// Multer 설정 (이미지 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../frontend/public/images")); // 프론트엔드 public/images 폴더에 저장
  },
  filename: (req, file, cb) => {
    // 파일명을 현재 시간 + 랜덤 문자열 + 원본 확장자로 설정
    const ext = path.extname(file.originalname);
    const name = Date.now() + '_' + Math.random().toString(36).substring(7) + ext;
    cb(null, name);
  },
});

// 파일 필터 (이미지만 허용)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

// 이미지 업로드 전용 엔드포인트 (프론트엔드에서 사용)
app.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
    }

    // 업로드된 파일 정보 반환
    res.json({
      message: '이미지 업로드 성공',
      filename: req.file.filename,
      path: `/images/${req.file.filename}`,
      size: req.file.size
    });
  } catch (error) {
    console.error('이미지 업로드 에러:', error);
    res.status(500).json({ error: '이미지 업로드 실패' });
  }
});

// 상품 목록 조회
app.get("/products", (req, res) => {
  const sql = `SELECT id, name, brand, price, description, image, stock, created_at
                FROM products ORDER BY id DESC`;
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB 오류", err });
    res.json(result);
  });
});

// 특정 상품 조회
app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM products WHERE id = ?`;
  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB 오류", err });
    res.json(result[0] || {});
  });
});

// 상품 등록 (이미지 URL 방식과 파일 업로드 방식 둘 다 지원)
app.post("/products", (req, res) => {
  const { name, brand, price, description, stock, image } = req.body;
  
  const sql = `INSERT INTO products (name, brand, price, description, image, stock)
               VALUES (?, ?, ?, ?, ?, ?)`;
  
  connection.query(
    sql,
    [name, brand, price, description, image, stock],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB 오류", err });
      res.json({
        id: result.insertId,
        name,
        brand,
        price,
        description,
        image,
        stock,
      });
    }
  );
});

// 상품 수정 (이미지 URL 방식과 파일 업로드 방식 둘 다 지원)
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, brand, price, description, stock, image } = req.body;
  
  const sql = `UPDATE products
                SET name=?, brand=?, price=?, description=?, image=?, stock=?
                WHERE id=?`;
  
  connection.query(
    sql,
    [name, brand, price, description, image, stock, id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB 오류", err });
      res.json({ id, name, brand, price, description, image, stock });
    }
  );
});

// 상품 삭제
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM products WHERE id=?`;
  connection.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: "DB 오류", err });
    res.json({ message: "✅ 상품 삭제 성공", id });
  });
});

// 에러 핸들링 미들웨어
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '파일 크기가 너무 큽니다. (최대 5MB)' });
    }
  }
  res.status(500).json({ error: error.message });
});

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
  console.log(`🌐 API Endpoints:`);
  console.log(`   - GET    /products`);
  console.log(`   - GET    /products/:id`);
  console.log(`   - POST   /products`);
  console.log(`   - PUT    /products/:id`);
  console.log(`   - DELETE /products/:id`);
  console.log(`   - POST   /upload-image`);
  console.log(`   - POST   /cart`);
  console.log(`   - GET    /cart/:userId`);
});