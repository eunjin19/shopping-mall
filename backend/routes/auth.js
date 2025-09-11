import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../index.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "my-secret-key";

// 회원가입 (평문 비밀번호 저장)
router.post("/register", (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "필수 입력값 누락" });
  }

  db.query(
    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
    [username, email, password, role || "user"],
    (err, result) => {
      if (err) {
        console.error("회원가입 에러:", err);
        return res.status(500).json({ message: "회원가입 실패" });
      }
      res.json({ message: "회원가입 성공" });
    }
  );
});

// 로그인 (평문 비교)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // ✅ 관리자 계정 특별 처리 (DB 조회 없이 바로 처리)
  if (username === "admin" && password === "admin30203") {
    const token = jwt.sign(
      { id: 1, username: "admin", role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "관리자 로그인 성공",
      token,
      user: {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        role: "admin",
      },
    });
  }

  // ✅ 일반 사용자 DB 조회
  db.query("SELECT * FROM users WHERE username = ?", [username], (err, rows) => {
    if (err) return res.status(500).json({ message: "로그인 실패" });
    if (rows.length === 0)
      return res.status(400).json({ message: "존재하지 않는 사용자" });

    const user = rows[0];

    // ✅ 비밀번호 확인
    if (password !== user.password) {
      return res.status(400).json({ message: "비밀번호 불일치" });
    }

    // ✅ 일반 사용자 토큰 생성
    const role = user.role || "user";
    const token = jwt.sign(
      { id: user.id, username: user.username, role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "로그인 성공",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role,
      },
    });
  });
});

// ✅ 토큰 검증 엔드포인트 (선택사항)
router.get("/verify", (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '토큰이 필요합니다' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다' });
    }
    res.json({ user, message: '토큰이 유효합니다' });
  });
});

export default router;