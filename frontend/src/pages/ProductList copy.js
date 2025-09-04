import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // 상세페이지 이동용
import { getProducts } from "../utils/api"; // API 호출 함수

const ProductListPage = () => {
  const [list, setList] = useState([]);        // 상품 목록
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts(); // /api/products 불러오기
        setList(data);
      } catch (err) {
        console.error("상품 목록 불러오기 실패:", err);
        setError("상품 목록을 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-list">
      <h1>상품 목록</h1>
      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", textAlign: "center" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>상품명</th>
            <th>브랜드</th>
            <th>가격</th>
            <th>재고</th>
            <th>등록일</th>
          </tr>
        </thead>
        <tbody>
          {list.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                {/* 상세 페이지로 이동 (예: /product/1) */}
                <Link to={`/product/${product.id}`}>{product.name}</Link>
              </td>
              <td>{product.brand}</td>
              <td>{product.price.toLocaleString()}원</td>
              <td>{product.stock}</td>
              <td>{new Date(product.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductListPage;
