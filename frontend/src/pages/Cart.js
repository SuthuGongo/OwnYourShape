import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import API from '../api/axios';
import './Cart.css';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, deliveryFee } = useCart();
  const [promo, setPromo]               = useState('');
  const [promoMsg, setPromoMsg]         = useState({ text: '', type: '' });
  const [discount, setDiscount]         = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const navigate = useNavigate();

  const handlePromo = async () => {
    try {
      const { data } = await API.post('/orders/validate-promo/', { code: promo });
      const disc = Math.round(subtotal * data.discount_percent / 100);
      setDiscount(disc);
      setPromoApplied(true);
      setPromoMsg({ text: `Code ${data.code} applied — ${data.discount_percent}% off`, type: 'success' });
    } catch {
      setPromoMsg({ text: 'Invalid promo code.', type: 'error' });
    }
  };

  const discountedSubtotal = subtotal - discount;
  const finalDelivery      = discountedSubtotal >= 850 ? 0 : deliveryFee;
  const finalTotal         = discountedSubtotal + finalDelivery;
  const toFree             = Math.max(0, 850 - discountedSubtotal);
  const pct                = Math.min(100, Math.round((discountedSubtotal / 850) * 100));
  const totalQty           = cartItems.reduce((a, i) => a + i.quantity, 0);

  return (
    <>
      <Header />
      <div className="breadcrumb">
        <span className="bc" onClick={() => navigate('/')}>Home</span>
        <span className="bc-sep">›</span>
        <span className="bc cur">Your Bag</span>
      </div>

      <div className="co-steps">
        {['Bag', 'Details', 'Payment', 'Confirm'].map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className="co-step-line" />}
            <div className="co-step">
              <div className={`co-step__num${i === 0 ? ' active' : ''}`}>{i + 1}</div>
              <span className={`co-step__label${i === 0 ? ' active' : ''}`}>{s}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <main className="cart-page">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <h2 className="cart-empty__title">Your bag is empty</h2>
            <p className="cart-empty__sub">Looks like you haven't added anything yet.</p>
            <Link to="/swimwear" className="btn-primary" style={{ textDecoration:'none', padding:'14px 28px', fontSize:'10px', letterSpacing:'.22em', textTransform:'uppercase' }}>
              Shop Swimwear
            </Link>
          </div>
        ) : (
          <div className="cart-layout">

            {/* ── Left: Items ── */}
            <div className="cart-items">
              <h1 className="cart-title">Your Bag <span>({totalQty} items)</span></h1>

              {cartItems.map((item) => (
                <div className="cart-item" key={`${item.id}-${item.size}-${item.colour}`}>

                  {/* Image — clickable */}
                  <Link to={`/products/${item.slug}`} className="cart-item__img">
                    {item.image
                      ? <img src={item.image} alt={item.name} />
                      : <div className="cart-item__img-ph">{item.name}</div>
                    }
                  </Link>

                  <div className="cart-item__details">
                    <p className="cart-item__brand">Own Your Shape</p>
                    <p className="cart-item__name">{item.name}</p>
                    <div className="cart-item__meta">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.colour && <><span>·</span><span>{item.colour}</span></>}
                    </div>
                    <div className="cart-item__meta" style={{ marginTop:'6px', gap:'12px' }}>
                      <button className="cart-item__action" onClick={() => removeFromCart(item.id, item.size, item.colour)}>Remove</button>
                      <Link to={`/products/${item.slug}`} className="cart-item__action">View item</Link>
                    </div>
                    <div className="cart-qty">
                      <button className="cart-qty__btn" onClick={() => updateQuantity(item.id, item.size, item.colour, item.quantity - 1)}>−</button>
                      <span className="cart-qty__val">{item.quantity}</span>
                      <button className="cart-qty__btn" onClick={() => updateQuantity(item.id, item.size, item.colour, item.quantity + 1)}>+</button>
                    </div>
                  </div>

                  <div className="cart-item__price-col">
                    <p className="cart-item__price">R {(item.price * item.quantity).toLocaleString()}</p>
                    <button className="cart-item__remove" onClick={() => removeFromCart(item.id, item.size, item.colour)} aria-label="Remove">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Promo */}
              <div className="cart-promo">
                <input className="cart-promo__input" placeholder="Promo code" value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())} disabled={promoApplied} />
                <button className="cart-promo__btn" onClick={handlePromo} disabled={promoApplied || !promo}>Apply</button>
              </div>
              {promoMsg.text && (
                <p className={promoMsg.type === 'success' ? 'api-success' : 'api-error'} style={{ marginTop:'8px', fontSize:'12px' }}>
                  {promoMsg.text}
                </p>
              )}
              <button className="cart-continue" onClick={() => navigate('/swimwear')}>← Continue Shopping</button>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="cart-summary">
              <h2 className="cart-summary__title">Order Summary</h2>

              {/* Mini product list with images */}
              <div className="cart-summary__items">
                {cartItems.map((item) => (
                  <div className="cart-summary__item" key={`sum-${item.id}-${item.size}-${item.colour}`}>
                    <div className="cart-summary__item-img">
                      {item.image
                        ? <img src={item.image} alt={item.name} />
                        : <div className="cart-summary__item-ph">{item.name[0]}</div>
                      }
                      <span className="cart-summary__item-qty">{item.quantity}</span>
                    </div>
                    <div className="cart-summary__item-info">
                      <p className="cart-summary__item-name">{item.name}</p>
                      <p className="cart-summary__item-meta">
                        {item.size}{item.colour ? ` · ${item.colour}` : ''}
                      </p>
                    </div>
                    <p className="cart-summary__item-price">R {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="cart-summary__row" style={{ marginTop:'1rem' }}>
                <span>Subtotal</span><span>R {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="cart-summary__row discount">
                  <span>Promo discount</span><span>−R {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="cart-summary__row">
                <span>Delivery</span>
                <span>{finalDelivery === 0 ? 'Free' : `R ${finalDelivery}`}</span>
              </div>

              {/* Free delivery bar */}
              <div className="cart-delivery-bar">
                <p className="cart-delivery-bar__label">Free delivery progress</p>
                <div className="cart-delivery-bar__track">
                  <div className="cart-delivery-bar__fill" style={{ width:`${pct}%` }} />
                </div>
                <p className="cart-delivery-bar__note">
                  {discountedSubtotal >= 850
                    ? <strong>🎉 You have free delivery!</strong>
                    : <>Add <strong>R {toFree.toLocaleString()}</strong> more for free delivery</>
                  }
                </p>
              </div>

              <div className="cart-summary__total">
                <span>Total</span><span>R {finalTotal.toLocaleString()}</span>
              </div>

              <button className="btn-primary" onClick={() => navigate('/checkout', { state:{ discount, promoCode: promo } })}>
                Proceed to Checkout
              </button>

              <div className="cart-payment-icons">
                {['Visa','Mastercard','EFT','PayFast'].map((p) => (
                  <span key={p} className="cart-pay-icon">{p}</span>
                ))}
              </div>
              <div className="cart-secure">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="3" y="11" width="18" height="11" rx="1"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                SSL secured checkout
              </div>
            </div>

          </div>
        )}
      </main>
      <Footer />
    </>
  );
}