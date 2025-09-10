import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminProductPage.css";

const AdminProductPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
    image: "",
    stock: 100,
  });
  const [editingId, setEditingId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ 상품 불러오기
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/products");
      setProducts(res.data);
    } catch (err) {
      console.error("상품 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ 입력 변경
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ 이미지 업로드 (드래그 or 파일 선택)
  const uploadImage = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return null;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await axios.post("http://localhost:5000/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.filename; // 서버에서 반환한 파일명
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert("이미지 업로드에 실패했습니다 ❌");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ✅ 파일 선택 (클릭)
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);

      const filename = await uploadImage(file);
      if (filename) {
        setForm({ ...form, image: `/images/${filename}` });
      }
    }
  };

  // ✅ 드래그 앤 드롭
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((f) => f.type.startsWith("image/"));

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(imageFile);

      const filename = await uploadImage(imageFile);
      if (filename) {
        setForm({ ...form, image: `/images/${filename}` });
      }
    }
  };

  // ✅ 이미지 미리보기 삭제
  const removeImage = () => {
    setForm({ ...form, image: "" });
    setImagePreview(null);
  };

  // ✅ 등록 & 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/products/${editingId}`, form);
        alert("상품이 수정되었습니다 ✅");
        setEditingId(null);
      } else {
        await axios.post("http://localhost:5000/products", form);
        alert("상품이 등록되었습니다 ✅");
      }
      setForm({ name: "", brand: "", price: "", description: "", image: "", stock: 100 });
      setImagePreview(null);
      fetchProducts();
    } catch (err) {
      console.error("상품 등록/수정 실패:", err);
      alert("상품 등록/수정 중 오류 발생 ❌");
    }
  };

  // ✅ 수정 모드
  const handleEdit = (p) => {
    setForm(p);
    setEditingId(p.id);
    if (p.image) {
      setImagePreview(p.image.startsWith("/images/") ? `http://localhost:5000${p.image}` : p.image);
    }
  };

  // ✅ 삭제
  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`http://localhost:5000/products/${id}`);
        alert("상품이 삭제되었습니다 🗑️");
        fetchProducts();
      } catch (err) {
        console.error("상품 삭제 실패:", err);
        alert("상품 삭제 중 오류 발생 ❌");
      }
    }
  };

  return (
    <div className="admin-page">
      <h1>🛍️ 관리자 상품 관리</h1>

      {/* ✅ 상품 등록/수정 폼 */}
      <form onSubmit={handleSubmit} className="product-form">
        <input name="name" placeholder="상품명" value={form.name} onChange={handleChange} required />
        <input name="brand" placeholder="브랜드" value={form.brand} onChange={handleChange} />
        <input name="price" type="number" placeholder="가격" value={form.price} onChange={handleChange} required />
        <input name="stock" type="number" placeholder="재고" value={form.stock} onChange={handleChange} />
        <textarea name="description" placeholder="상품 설명" value={form.description} onChange={handleChange} />

        {/* ✅ 이미지 업로드 (드래그 & 드롭 + 클릭) */}
        <div
          className={`image-drop-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {imagePreview ? (
            <div className="image-preview-container">
              <img src={imagePreview} alt="미리보기" className="image-preview" />
              <button type="button" onClick={removeImage}>❌</button>
            </div>
          ) : (
            <div className="upload-placeholder">
              {uploading ? "📤 업로드 중..." : "📷 이미지를 드래그하거나 클릭하여 업로드"}
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFileSelect} className="file-input" disabled={uploading} />
        </div>

        <button type="submit" disabled={uploading}>
          {editingId ? "✅ 수정 완료" : "➕ 상품 등록"}
        </button>
      </form>

              {/* ✅ 상품 목록 (이미지 포함, ProductList.js 스타일 적용) */}
<div className="product-list">
  <h1>PRODUCT LIST</h1>

  {products.length === 0 ? (
    <div className="no-data">상품이 없습니다.</div>
  ) : (
    <div className="product-grid">
      {products.map((item) => (
        <div key={item.id} className="product-card">
          <div className="product-image">
            {item.image ? (
              <img src= {`${item.image}`}/>
            ) : (
              <div className="no-image">이미지 없음</div>
            )}
          </div>

          <div className="product-info">
            <div className="product-brand">{item.brand || "No Brand"}</div>
            <div className="product-name">{item.name}</div>
            <div className="product-description">{item.description}</div>
            <div className="product-price">
              {item.price ? item.price.toLocaleString() + "원" : "-"}
            </div>

            <div className="product-meta">
              <span
                className={`product-stock ${
                  item.stock <= 0 ? "out-of-stock" : ""
                }`}
              >
                {item.stock > 0 ? `재고 ${item.stock}개` : "품절"}
              </span>
              <span className="product-date">
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("ko-KR")
                  : "-"}
              </span>
            </div>
          </div>

          <div className="product-actions">
            <button className="edit-btn" onClick={() => handleEdit(item)}>
              ✏️ 수정
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDelete(item.id)}
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>



    </div>
  );
};

export default AdminProductPage;