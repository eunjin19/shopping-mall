// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import jwt from "jsonwebtoken";

// 라우터 불러오기
import authRouter from "./routes/auth.js";
import cartRouter from "./routes/cart.js";

dotenv.config();

const app = express();

// __dirname 대체 코드
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 미들웨어
app.use(cors());
app.use(express.json());

// JWT 시크릿 키 (환경변수로 설정하는 것이 좋습니다)
const JWT_SECRET = process.env.JWT_SECRET || "my-secret-key";

// 로그인/회원가입 라우터
app.use("/auth", authRouter);

// ✅ 장바구니 라우터 연결
app.use("/cart", cartRouter);

// images 폴더 없으면 생성
const imagesDir = path.join(__dirname, "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 정적 파일 제공 (이미지 접근)
app.use("/images", express.static(path.join(__dirname, "images")));

// MySQL 연결
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

// ✅ 다른 라우터에서 DB 사용 가능하게 export
export const db = connection;

/* ------------------------ 인증 미들웨어 ------------------------ */

// ✅ 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: '토큰이 필요합니다' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다' });
    }
    req.user = user;
    next();
  });
};

// ✅ 관리자 권한 검증 미들웨어
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: '인증이 필요합니다' });
  }
  
  if (req.username.role !== 'admin') {
    return res.status(403).json({ message: '관리자 권한이 필요합니다' });
  }
  
  next();
};

/* ------------------------ 파일 업로드 & 상품 API ------------------------ */

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../frontend/public/images"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name =
      Date.now() + "_" + Math.random().toString(36).substring(7) + ext;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("이미지 파일만 업로드 가능합니다."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});

// ✅ 이미지 업로드 (관리자만)
app.post("/upload-image", authenticateToken, requireAdmin, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "이미지 파일이 필요합니다." });
    }
    res.json({
      message: "이미지 업로드 성공",
      filename: req.file.filename,
      path: `/images/${req.file.filename}`,
      size: req.file.size,
    });
  } catch (error) {
    res.status(500).json({ error: "이미지 업로드 실패" });
  }
});

// 상품 목록 조회 (모든 사용자)
app.get("/products", (req, res) => {
  const sql = `SELECT id, name, brand, price, description, image, stock, created_at
                FROM products ORDER BY id DESC`;
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB 오류", err });
    res.json(result);
  });
});

// 특정 상품 조회 (모든 사용자)
app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM products WHERE id = ?`;
  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB 오류", err });
    res.json(result[0] || {});
  });
});

// ✅ 상품 등록 (관리자만)
app.post("/products", authenticateToken, requireAdmin, (req, res) => {
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

// ✅ 상품 수정 (관리자만)
app.put("/products/:id", authenticateToken, requireAdmin, (req, res) => {
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

// ✅ 상품 삭제 (관리자만)
app.delete("/products/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM products WHERE id=?`;
  connection.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: "DB 오류", err });
    res.json({ message: "✅ 상품 삭제 성공", id });
  });
});

/* ------------------------ 에러 핸들러 ------------------------ */
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "파일 크기가 너무 큽니다. (최대 5MB)" });
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
  console.log(`   - POST   /products (관리자 전용)`);
  console.log(`   - PUT    /products/:id (관리자 전용)`);
  console.log(`   - DELETE /products/:id (관리자 전용)`);
  console.log(`   - POST   /upload-image (관리자 전용)`);
  console.log(`   - POST   /cart`);
  console.log(`   - GET    /cart/:userId`);
  console.log(`   - PATCH  /cart/:userId/:productId`);
  console.log(`   - DELETE /cart/:userId/:productId`);
});