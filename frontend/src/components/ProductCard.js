import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [adding, setAdding]     = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.isAdmin) return; // admins cannot shop
    if (product.stock === 0) return;

    setAdding(true);
    const result = await addToCart(product._id, 1);
    setAdding(false);

    if (result.success) {
      setFeedback('Added!');
      setTimeout(() => setFeedback(''), 1800);
    } else {
      setFeedback(result.message || 'Error');
      setTimeout(() => setFeedback(''), 2500);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="product-card card fade-in">
      <div className="product-image-wrap">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {isOutOfStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="low-stock-badge">Only {product.stock} left</div>
        )}
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {!user?.isAdmin && (
            <button
              className={`btn btn-primary btn-sm add-btn ${feedback === 'Added!' ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
            >
              {adding ? (
                <span className="btn-spinner" />
              ) : feedback ? (
                feedback
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
