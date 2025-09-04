const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// MySQL 연결 설정
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'user_auth_db'
});

// 데이터베이스 연결 확인
db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
    return;
  }
  console.log('MySQL 연결 성공');
});

// JWT 시크릿 키 (환경변수로 설정하세요)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// 회원가입 API
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 입력 값 검증
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '모든 필드를 입력해주세요.'
      });
    }

    // 사용자명 길이 검증
    if (username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: '사용자명은 최소 3자 이상이어야 합니다.'
      });
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 최소 6자 이상이어야 합니다.'
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '올바른 이메일 형식을 입력해주세요.'
      });
    }

    // 중복 사용자 확인
    const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(checkUserQuery, [username.trim(), email.trim()], async (err, results) => {
      if (err) {
        console.error('사용자 확인 오류:', err);
        return res.status(500).json({
          success: false,
          message: '서버 오류가 발생했습니다.'
        });
      }

      if (results.length > 0) {
        const existingUser = results[0];
        if (existingUser.username === username.trim()) {
          return res.status(409).json({
            success: false,
            message: '이미 존재하는 사용자명입니다.'
          });
        }
        if (existingUser.email === email.trim()) {
          return res.status(409).json({
            success: false,
            message: '이미 존재하는 이메일입니다.'
          });
        }
      }

      try {
        // 비밀번호 해시화
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 새 사용자 생성
        const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(insertUserQuery, [username.trim(), email.trim(), hashedPassword], (err, result) => {
          if (err) {
            console.error('사용자 생성 오류:', err);
            return res.status(500).json({
              success: false,
              message: '회원가입 중 오류가 발생했습니다.'
            });
          }

          res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.'
          });
        });
      } catch (hashError) {
        console.error('비밀번호 해시 오류:', hashError);
        res.status(500).json({
          success: false,
          message: '서버 오류가 발생했습니다.'
        });
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 로그인 API
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 입력 값 검증
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '사용자명과 비밀번호를 모두 입력해주세요.'
      });
    }

    // 사용자 확인
    const getUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(getUserQuery, [username.trim()], async (err, results) => {
      if (err) {
        console.error('사용자 조회 오류:', err);
        return res.status(500).json({
          success: false,
          message: '서버 오류가 발생했습니다.'
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      const user = results[0];

      try {
        // 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
          });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
          { 
            userId: user.id, 
            username: user.username,
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // 사용자 정보 (비밀번호 제외)
        const userInfo = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        };

        res.json({
          success: true,
          message: '로그인이 완료되었습니다.',
          data: {
            token,
            user: userInfo
          }
        });
      } catch (compareError) {
        console.error('비밀번호 비교 오류:', compareError);
        res.status(500).json({
          success: false,
          message: '서버 오류가 발생했습니다.'
        });
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '액세스 토큰이 필요합니다.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }
    req.user = user;
    next();
  });
};

// 사용자 정보 조회 API (보호된 라우트 예시)
app.get('/auth/me', authenticateToken, (req, res) => {
  const getUserQuery = 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';
  db.query(getUserQuery, [req.user.userId], (err, results) => {
    if (err) {
      console.error('사용자 정보 조회 오류:', err);
      return res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: {
        user: results[0]
      }
    });
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});