import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = express.Router();
const JWT_SECRET = "my-secret-key"; // 환경변수로 빼는 게 안전

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
      if (err) return res.status(500).json({ message: "비밀번호 검증 오류" });
      if (!isMatch) return res.status(400).json({ message: "비밀번호 불일치" });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // 👇 프론트엔드가 받기 쉽게 수정
      res.json({
        message: "로그인 성공",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    });
  });
});

// 현재 비밀번호 확인
router.post("/verify-password", (req, res) => {
  const { userId, currentPassword } = req.body;
  if (!userId || !currentPassword) {
    return res.status(400).json({ message: "필수 값 누락" });
  }

  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB 오류" });
    if (rows.length === 0) return res.status(404).json({ message: "사용자 없음" });

    const user = rows[0];
    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "검증 오류" });
      if (!isMatch) return res.json({ valid: false });

      res.json({ valid: true });
    });
  });
});

// 비밀번호 변경
router.post("/change-password", (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;

  if ((!username && !email) || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "필수 값 누락" });
  }

  const query = username
    ? "SELECT * FROM users WHERE username = ?"
    : "SELECT * FROM users WHERE email = ?";
  const value = username ? username : email;

  db.query(query, [value], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB 오류" });
    if (rows.length === 0)
      return res.status(404).json({ message: "사용자를 찾을 수 없음" });

    const user = rows[0];

    bcrypt.compare(currentPassword, user.password, async (err, isMatch) => {
      if (err) return res.status(500).json({ message: "검증 오류" });
      if (!isMatch)
        return res.status(400).json({ message: "현재 비밀번호 불일치" });

      const hashedPw = await bcrypt.hash(newPassword, 10);
      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPw, user.id],
        (err) => {
          if (err) return res.status(500).json({ message: "비밀번호 변경 실패" });
          res.json({
            success: true,
            message: "비밀번호가 성공적으로 변경되었습니다.",
          });
        }
      );
    });
  });
});

export default router;