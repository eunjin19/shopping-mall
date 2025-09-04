import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import authRouter from "./routes/auth.js";  // auth 라우터 import

dotenv.config();

const app = express();

// 기본 미들웨어
app.use(cors());
app.use(express.json());

// MySQL 연결 설정
let database = null;

const connectDB = () => {
  try {
    database = mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "1234",
      database: "shoppingmall"
    });

    database.connect(err => {
      if (err) {
        console.error("❌ DB 연결 실패:", err.message);
        database = null;
      } else {
        console.log("✅ MySQL Connected!");
      }
    });
  } catch (error) {
    console.error("❌ DB 설정 오류:", error.message);
    database = null;
  }
};

// DB 연결 실행
connectDB();

// DB를 req에 전달하는 미들웨어
app.use((req, res, next) => {
  req.db = database;
  next();
});

// ==================== 라우터 연결 ====================
app.use("/api/auth", authRouter);  // auth 라우터 연결

// ==================== 기본 라우트 ====================
app.get("/", (req, res) => {
  res.json({ 
    message: "Shopping Mall Backend API",
    status: "running",
    database: database ? "connected" : "disconnected",
    endpoints: {
      auth: ["/api/auth/register", "/api/auth/login"],
      products: ["/api/products"]
    }
  });
});

// ==================== 상품 API ====================
app.get("/api/products", (req, res) => {
  if (!database) {
    return res.json([
      {
        id: 1, name: "테스트 상품1", brand: "브랜드A", price: 10000,
        description: "테스트용 상품입니다.", image: "sample1.jpg", stock: 50
      },
      {
        id: 2, name: "테스트 상품2", brand: "브랜드B", price: 20000,
        description: "테스트용 상품입니다.", image: "sample2.jpg", stock: 30
      }
    ]);
  }

  const sql = "SELECT * FROM products ORDER BY created_at DESC";
  database.query(sql, (err, results) => {
    if (err) {
      console.error("상품 조회 에러:", err);
      return res.status(500).json({ error: "DB 조회 실패" });
    }
    res.json(results);
  });
});

// 특정 상품 조회
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  
  if (!database) {
    const sampleProduct = { id: 1, name: "테스트 상품1", brand: "브랜드A", price: 10000 };
    return res.json(sampleProduct);
  }

  const sql = "SELECT * FROM products WHERE id = ?";
  database.query(sql, [id], (err, results) => {
    if (err) {
      console.error("상품 상세 조회 에러:", err);
      return res.status(500).json({ error: "서버 오류" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "상품을 찾을 수 없습니다" });
    }
    
    res.json(results[0]);
  });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error("서버 에러:", err);
  res.status(500).json({ error: "서버 내부 에러" });
});

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
  console.log(`🌐 API Endpoints:`);
  console.log(`   - GET  /`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/products`);
  console.log(`   - GET  /api/products/:id`);
});

export { database as db };