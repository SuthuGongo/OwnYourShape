import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '5rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--n400)' }}>404 — Page not found</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 52, fontWeight: 300, color: 'var(--n900)' }}>Oops.</h1>
        <p style={{ fontSize: 14, color: 'var(--n500)', maxWidth: 360, lineHeight: 1.8 }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
      <Footer />
    </>
  );
}
