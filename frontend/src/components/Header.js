import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const nav = [
    { to: '/',          label: 'Home' },
    { to: '/gymwear',   label: 'Gymwear' },
    { to: '/swimwear',  label: 'Swimwear' },
    { to: '/contact',   label: 'Contact' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {/* Promo strip */}
      <div className="promo-strip">
        <div className="promo-marquee">
          <span>
            Hello Gorgeous! 10% off your first order — use code&nbsp;<strong>WELCOME</strong>
            &nbsp;·&nbsp;Free delivery on orders over R850&nbsp;·&nbsp;
            Hello Gorgeous! 10% off your first order — use code&nbsp;<strong>WELCOME</strong>
            &nbsp;·&nbsp;Free delivery on orders over R850&nbsp;·&nbsp;
          </span>
        </div>
      </div>

      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="header-inner">

          <Link to="/" className="header-logo">
            <span className="logo-name">Own Your Shape</span>
            <span className="logo-sub">Gymwear &amp; Swimwear</span>
          </Link>

          <nav className="header-nav" aria-label="Main">
            <ul>
              {nav.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={location.pathname === l.to ? 'active' : ''}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-icons">
            <Link to={user ? '/profile' : '/account'} className="icon-btn" aria-label="Account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              {user && <span className="user-dot" />}
            </Link>

            <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`mobile-drawer${menuOpen ? ' open' : ''}`}>
        <ul>
          {nav.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}
          <li><Link to="/cart">Bag ({totalItems})</Link></li>
          {user ? (
            <>
              <li><Link to="/profile">My Account</Link></li>
              <li><button onClick={handleLogout} className="drawer-logout">Log Out</button></li>
            </>
          ) : (
            <li><Link to="/account">Log In / Register</Link></li>
          )}
        </ul>
      </div>
      {menuOpen && <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
