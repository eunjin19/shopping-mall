import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>가격: {product.price?.toLocaleString()}원</p>
      <p>{product.description}</p>
    </div>
  );
};

export default ProductCard;
