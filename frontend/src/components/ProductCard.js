import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../api/axios';
import './ProductCard.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductCard({ product, onWishlistToggle }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [added, setAdded]               = useState(false);
  const [wishlisted, setWishlisted]     = useState(product.is_wishlisted || false);

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users/wishlist/', { product_id: product.id });
      setWishlisted((v) => !v);
      if (onWishlistToggle) onWishlistToggle(product.id);
    } catch {
      // if not logged in, just toggle visually
      setWishlisted((v) => !v);
    }
  };

  const isOnSale = product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price);

  return (
    <Link to={`/products/${product.slug}`} className="p-card">
      <div className="p-card__img-wrap">
        {product.main_image_url ? (
          <img src={product.main_image_url} alt={product.name} className="p-card__img" loading="lazy" />
        ) : (
          <div className="p-card__img p-card__img--placeholder">{product.name}</div>
        )}

        {isOnSale && <span className="p-card__badge p-card__badge--sale">Sale</span>}
        {product.is_featured && !isOnSale && <span className="p-card__badge p-card__badge--new">New</span>}

        <button className={`p-card__wish${wishlisted ? ' on' : ''}`} onClick={handleWishlist} aria-label="Wishlist">
          <svg viewBox="0 0 24 24" width="14" height="14" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>

        <div className="p-card__overlay">
          <div className="p-card__sizes">
            {SIZES.map((s) => (
              <button
                key={s}
                className={`sz-pill${selectedSize === s ? ' on' : ''}`}
                onClick={(e) => { e.preventDefault(); setSelectedSize(s); }}
              >{s}</button>
            ))}
          </div>
          <button className={`p-card__add${added ? ' done' : ''}`} onClick={handleAdd}>
            {added ? 'Added ✓' : 'Add to Bag'}
          </button>
        </div>
      </div>

      <div className="p-card__info">
        <p className="p-card__name">{product.name}</p>
        <p className="p-card__price">
          {isOnSale && <span className="p-card__was">R {parseFloat(product.compare_at_price).toLocaleString()}</span>}
          R {parseFloat(product.price).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}