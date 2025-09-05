import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();

// __dirname 대체 코드
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 제공
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/auth", authRouter);






// MySQL 연결
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "shoppingmall"
});

db.connect(err => {
  if (err) {
    console.error("❌ DB 연결 실패:", err);
    process.exit(1);
  }
  console.log("✅ DB 연결 성공");
});

// app.get("/products", (req, res) => {
//   res.send("테스트 OK");
// });

// 상품 목록 조회 API
app.get("/products", (req, res) => {
  const sql = `SELECT id, name, brand, price, description, image, stock, created_at 
               FROM products ORDER BY id DESC`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB 오류", err });
    res.json(result);
  });
});

// 특정 상품 조회 API
app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT id, name, brand, price, description, image, stock, created_at 
               FROM products WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB 오류", err });
    res.json(result[0] || {});
  });
});

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
  console.log(`🌐 API Endpoints:`);
  console.log(`   - GET  /products`);
  console.log(`   - GET  /products/:id`);
});
