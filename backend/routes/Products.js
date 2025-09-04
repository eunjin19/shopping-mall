import express from "express";

const router = express.Router();

app.get("/", (req, res) => {
  res.send("서버가 실행 중입니다!");
});

// 테스트용 간단한 라우트
router.get("/", (req, res) => {
  res.json({ 
    message: "Products API working!",
    data: []
  });
});

router.get("/test", (req, res) => {
  res.json({ message: "Test route working!" });
});
app.get("/api/products", (req, res) => {
  res.json(products);
});

export default router;