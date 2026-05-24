// ─── Profile.js ────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('orders');

  useEffect(() => {
    if (!user) { navigate('/account'); return; }
    API.get('/orders/my-orders/').then(({ data }) => setOrders(data.results || data)).catch(console.error).finally(() => setLoading(false));
  }, [user, navigate]);

  const s = { padding: '3rem', maxWidth: 900, margin: '0 auto', minHeight: '70vh' };
  const tabStyle = (t) => ({ padding: '.875rem 1.5rem', fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--n900)' : '2px solid transparent', color: tab === t ? 'var(--n900)' : 'var(--n400)', transition: 'all .2s' });

  return (
    <>
      <Header />
      <main style={s}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid var(--n200)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 300, color: 'var(--n900)' }}>My Account</h1>
          <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: 'none', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--n500)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Log Out</button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--n500)', marginBottom: '2rem' }}>
          Welcome back, <strong style={{ color: 'var(--n700)', fontWeight: 400 }}>{user?.first_name}</strong>
        </p>
        <div style={{ display: 'flex', borderBottom: '0.5px solid var(--n200)', marginBottom: '2rem' }}>
          <button style={tabStyle('orders')} onClick={() => setTab('orders')}>My Orders</button>
          <button style={tabStyle('wishlist')} onClick={() => setTab('wishlist')}>Wishlist</button>
        </div>
        {tab === 'orders' && (
          loading ? <div className="spinner-wrap"><div className="spinner" /></div> :
          orders.length === 0 ? <p style={{ color: 'var(--n400)', fontSize: 14 }}>You haven't placed any orders yet.</p> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {orders.map((o) => (
              <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center', padding: '1.25rem 0', borderBottom: '0.5px solid var(--n100)', fontSize: 13 }}>
                <div><p style={{ fontWeight: 400, color: 'var(--n900)' }}>{o.order_number}</p><p style={{ color: 'var(--n400)', fontSize: 11 }}>{new Date(o.created_at).toLocaleDateString()}</p></div>
                <p style={{ color: 'var(--n700)' }}>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</p>
                <span style={{ display: 'inline-block', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', padding: '4px 10px', background: 'var(--n100)', color: 'var(--n700)', border: '0.5px solid var(--n200)' }}>{o.status}</span>
                <p style={{ color: 'var(--n900)', fontWeight: 400 }}>R {parseFloat(o.total).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'wishlist' && <p style={{ color: 'var(--n400)', fontSize: 14 }}>Your wishlist is empty.</p>}
      </main>
      <Footer />
    </>
  );
}
