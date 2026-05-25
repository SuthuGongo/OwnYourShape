// ─── OrderConfirm.js ──────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API from '../api/axios';

export function OrderConfirm() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/${orderNumber}/`)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderNumber]);

  return (
    <>
      <Header />

      <main
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '5rem 2rem',
          minHeight: '70vh',
        }}
      >
        {loading ? (
          <div className="spinner-wrap">
            <div className="spinner" />
          </div>
        ) : order ? (
          <div style={{ textAlign: 'center' }}>
            {/* Success Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                background: 'var(--n100)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--n700)"
                strokeWidth="1.4"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Heading */}
            <p
              style={{
                fontSize: 10,
                letterSpacing: '.28em',
                textTransform: 'uppercase',
                color: 'var(--n400)',
                marginBottom: '.75rem',
              }}
            >
              Order confirmed
            </p>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 38,
                fontWeight: 300,
                color: 'var(--n900)',
                marginBottom: '.75rem',
              }}
            >
              Thank you!
            </h1>

            <p
              style={{
                fontSize: 14,
                color: 'var(--n500)',
                marginBottom: '2rem',
                lineHeight: 1.8,
              }}
            >
              Your order{' '}
              <strong
                style={{
                  color: 'var(--n700)',
                  fontWeight: 400,
                }}
              >
                {order.order_number}
              </strong>{' '}
              has been placed.
              <br />
              A confirmation will be sent to {order.email}.
            </p>

            {/* Order Details */}
            <div
              style={{
                background: 'var(--n50)',
                border: '0.5px solid var(--n200)',
                padding: '1.75rem',
                marginBottom: '2rem',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: '.2em',
                  textTransform: 'uppercase',
                  color: 'var(--n700)',
                  marginBottom: '1rem',
                  fontWeight: 400,
                }}
              >
                Order details
              </p>

              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '.625rem 0',
                    borderBottom: '0.5px solid var(--n100)',
                    fontSize: 13,
                    color: 'var(--n700)',
                  }}
                >
                  <span>
                    {item.product_name}{' '}
                    {item.size && `(${item.size})`} × {item.quantity}
                  </span>

                  <span>
                    R {parseFloat(item.line_total).toLocaleString()}
                  </span>
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '1rem 0 0',
                  fontSize: 16,
                  color: 'var(--n900)',
                  fontWeight: 400,
                }}
              >
                <span>Total</span>

                <span>
                  R {parseFloat(order.total).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link to="/swimwear" className="btn-primary">
                Continue Shopping
              </Link>

              <Link to="/" className="btn-ghost">
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--n400)',
            }}
          >
            Order not found.
          </p>
        )}
      </main>

      <Footer />
    </>
  );
}

export default OrderConfirm;