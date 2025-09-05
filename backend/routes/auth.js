// backend/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = express.Router();

// 회원가입
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "필수 입력값 누락" });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: "비밀번호 암호화 실패" });

    db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("회원가입 에러:", err);
          return res.status(500).json({ message: "회원가입 실패" });
        }
        res.json({ message: "회원가입 성공" });
      }
    );
  });
});

// 로그인
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], (err, rows) => {
    if (err) return res.status(500).json({ message: "로그인 실패" });
    if (rows.length === 0) return res.status(400).json({ message: "존재하지 않는 사용자" });

    const user = rows[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) return res.status(400).json({ message: "비밀번호 불일치" });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        "my-secret-key",
        { expiresIn: "1h" }
      );

      res.json({ message: "로그인 성공", data: { token, user } });
    });
  });
});

export default router;
