import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './Checkout.css';

const SA_PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'];

export default function Checkout() {
  const { cartItems, subtotal, deliveryFee, clearCart } = useCart();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const location      = useLocation();

  const { discount = 0, promoCode = '' } = location.state || {};
  const discountedSub = subtotal - discount;
  const finalDelivery = discountedSub >= 850 ? 0 : deliveryFee;
  const finalTotal    = discountedSub + finalDelivery;

  const [form, setForm] = useState({
    email:              user?.email || '',
    shipping_name:      user ? `${user.first_name} ${user.last_name}` : '',
    shipping_street:    '',
    shipping_city:      '',
    shipping_province:  '',
    shipping_postal_code: '',
    shipping_phone:     '',
    notes:              '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.email)               e.email = 'Required';
    if (!form.shipping_name)       e.shipping_name = 'Required';
    if (!form.shipping_street)     e.shipping_street = 'Required';
    if (!form.shipping_city)       e.shipping_city = 'Required';
    if (!form.shipping_province)   e.shipping_province = 'Required';
    if (!form.shipping_postal_code) e.shipping_postal_code = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiError('');
    try {
      const items = cartItems.map((i) => ({
        product_id: i.id, size: i.size, colour: i.colour, quantity: i.quantity,
      }));
      const { data } = await API.post('/orders/', {
        ...form,
        promo_code: promoCode,
        items,
      });
      clearCart();
      navigate(`/order/${data.order_number}`);
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) { navigate('/cart'); return null; }

  return (
    <>
      <Header />
      <div className="breadcrumb">
        <span className="bc" onClick={() => navigate('/')}>Home</span>
        <span className="bc-sep">›</span>
        <span className="bc" onClick={() => navigate('/cart')}>Bag</span>
        <span className="bc-sep">›</span>
        <span className="bc cur">Checkout</span>
      </div>

      <main className="checkout-page">
        <form className="checkout-layout" onSubmit={handleSubmit} noValidate>

          {/* Left: form */}
          <div className="checkout-form">
            <h1 className="checkout-title">Delivery Details</h1>

            <div className="checkout-section">
              <p className="checkout-section__label">Contact</p>
              <div className="field">
                <label className="field__label">Email address</label>
                <input className={`field__input${errors.email ? ' error' : ''}`} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@email.com" />
                {errors.email && <span className="checkout-field-error">{errors.email}</span>}
              </div>
              <div className="field" style={{ marginTop: '12px' }}>
                <label className="field__label">Phone (optional)</label>
                <input className="field__input" type="tel" value={form.shipping_phone} onChange={(e) => set('shipping_phone', e.target.value)} placeholder="+27 ..." />
              </div>
            </div>

            <div className="checkout-section">
              <p className="checkout-section__label">Shipping Address</p>
              <div className="checkout-field-row">
                <div className="field">
                  <label className="field__label">Full name</label>
                  <input className={`field__input${errors.shipping_name ? ' error' : ''}`} value={form.shipping_name} onChange={(e) => set('shipping_name', e.target.value)} placeholder="Jane Doe" />
                  {errors.shipping_name && <span className="checkout-field-error">{errors.shipping_name}</span>}
                </div>
              </div>
              <div className="field" style={{ marginTop: '12px' }}>
                <label className="field__label">Street address</label>
                <input className={`field__input${errors.shipping_street ? ' error' : ''}`} value={form.shipping_street} onChange={(e) => set('shipping_street', e.target.value)} placeholder="123 Main Road" />
                {errors.shipping_street && <span className="checkout-field-error">{errors.shipping_street}</span>}
              </div>
              <div className="checkout-field-row" style={{ marginTop: '12px' }}>
                <div className="field">
                  <label className="field__label">City</label>
                  <input className={`field__input${errors.shipping_city ? ' error' : ''}`} value={form.shipping_city} onChange={(e) => set('shipping_city', e.target.value)} placeholder="Cape Town" />
                  {errors.shipping_city && <span className="checkout-field-error">{errors.shipping_city}</span>}
                </div>
                <div className="field">
                  <label className="field__label">Postal code</label>
                  <input className={`field__input${errors.shipping_postal_code ? ' error' : ''}`} value={form.shipping_postal_code} onChange={(e) => set('shipping_postal_code', e.target.value)} placeholder="8001" />
                  {errors.shipping_postal_code && <span className="checkout-field-error">{errors.shipping_postal_code}</span>}
                </div>
              </div>
              <div className="field" style={{ marginTop: '12px' }}>
                <label className="field__label">Province</label>
                <select className={`field__input${errors.shipping_province ? ' error' : ''}`} value={form.shipping_province} onChange={(e) => set('shipping_province', e.target.value)}>
                  <option value="">Select province</option>
                  {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.shipping_province && <span className="checkout-field-error">{errors.shipping_province}</span>}
              </div>
            </div>

            <div className="checkout-section">
              <p className="checkout-section__label">Order notes (optional)</p>
              <textarea className="field__input checkout-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Special instructions..." rows={3} />
            </div>

            {apiError && <p className="api-error">{apiError}</p>}

            <button className="btn-primary checkout-submit" type="submit" disabled={loading}>
              {loading ? 'Placing Order…' : 'Place Order'}
            </button>
          </div>

          {/* Right: order summary */}
          <div className="checkout-summary">
            <h2 className="checkout-summary__title">Order Summary</h2>
            {cartItems.map((item) => (
              <div className="checkout-item" key={`${item.id}-${item.size}`}>
                <div className="checkout-item__img">
                  {item.image ? <img src={item.image} alt={item.name} /> : <div className="checkout-item__img-ph" />}
                  <span className="checkout-item__qty">{item.quantity}</span>
                </div>
                <div className="checkout-item__info">
                  <p className="checkout-item__name">{item.name}</p>
                  <p className="checkout-item__meta">{item.size}{item.colour ? ` · ${item.colour}` : ''}</p>
                </div>
                <p className="checkout-item__price">R {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="checkout-totals">
              <div className="checkout-totals__row"><span>Subtotal</span><span>R {subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="checkout-totals__row discount"><span>Discount</span><span>−R {discount.toLocaleString()}</span></div>}
              <div className="checkout-totals__row"><span>Delivery</span><span>{finalDelivery === 0 ? 'Free' : `R ${finalDelivery}`}</span></div>
              <div className="checkout-totals__total"><span>Total</span><span>R {finalTotal.toLocaleString()}</span></div>
            </div>
            <div className="checkout-payment-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="3" y="11" width="18" height="11" rx="1"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Payment details will be provided after your order is confirmed. We accept EFT, Visa, Mastercard and PayFast.
            </div>
          </div>

        </form>
      </main>
      <Footer />
    </>
  );
}
