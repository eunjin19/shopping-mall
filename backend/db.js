import mysql from "mysql2";

export const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "1234",
  database: process.env.DB_NAME || "shoppingmall",
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB 연결 실패:", err);
    process.exit(1);
  }
  console.log("✅ MySQL Connected!");
});
