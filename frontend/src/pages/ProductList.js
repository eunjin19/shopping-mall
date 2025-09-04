import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // 상세페이지 이동용
import { getProducts } from "../utils/api"; // API 호출 함수
import axios from "axios";

const ProductListPage = () => {
 


  const [list, setList] = useState([]);
    useEffect(() => {
    const list_db = axios.get("http://localhost:5000/products").then((res) => {
    console.log("res", res.data);
    setList(res.data);
    console.log("list",list)
    });
 }, []); // [] 두번째 매개변수를 통해 최초 한번만 가져오도록 함


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
            <th>상품 설명</th>
            <th>이미지</th>
            <th>재고</th>
            <th>날짜</th>
          </tr>
        </thead>
        <tbody>
        {list.map((item) => (
         

          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.brand}</td>
            <td>{item.price}</td>
            <td>{item.description}</td>
            <td>
                
              {item.image ? (
                <img src={item.image} alt={item.name} width="60" height="60" />
              ) : (
                "-"
              )}
            </td>
            <td>{item.stock}</td>
            <td>{item.created_at ? new Date(item.created_at).toLocaleString() : "-"}</td>
          </tr>
        ))}
        {list.length === 0 && (
          <tr>
            <td colSpan={8}>데이터가 없습니다.</td>
          </tr>
        )}
      </tbody>
      </table>
    </div>
  );
};

export default ProductListPage;
