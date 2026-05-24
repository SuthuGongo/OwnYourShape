// ─── Contact.js ────────────────────────────────────────────────────────────────
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export function Contact() {
  const navigate = useNavigate();
  const s = (extra = {}) => ({ ...extra });

  return (
    <>
      <Header />
      <div className="breadcrumb">
        <span className="bc" onClick={() => navigate('/')}>Home</span>
        <span className="bc-sep">›</span>
        <span className="bc cur">Contact</span>
      </div>
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '5rem 2rem 6rem', minHeight: '70vh', textAlign: 'center' }}>
        <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--n400)', marginBottom: '.75rem' }}>We're here for you</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px,6vw,64px)', fontWeight: 300, color: 'var(--n900)', marginBottom: '1.25rem' }}>Get in Touch</h1>
        <p style={{ fontSize: 15, color: 'var(--n500)', maxWidth: 460, margin: '0 auto 3.5rem', lineHeight: 1.8 }}>
          Questions about an order, sizing, or just want to say hello — we'd love to hear from you.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5px', background: 'var(--n200)', border: '0.5px solid var(--n200)', marginBottom: '3.5rem', textAlign: 'left' }}>
          {[
            { title: 'WhatsApp', detail: '+27 78 055 4190', note: 'WhatsApp messages only', href: 'https://wa.me/27780554190' },
            { title: 'Email', detail: 'info@ownyourshape.com', note: 'We reply within 24 hours', href: 'mailto:info@ownyourshape.com' },
            { title: 'Business Hours', detail: 'Mon–Fri: 9am–6pm · Sat: 10am–3pm', note: 'Closed Sundays & public holidays', href: null },
          ].map((c) => (
            <div key={c.title} style={{ background: 'var(--white)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 300, color: 'var(--n900)' }}>{c.title}</h3>
              {c.href ? (
                <a href={c.href} style={{ fontSize: 13, color: 'var(--n700)', borderBottom: '0.5px solid var(--n300)', paddingBottom: 1, width: 'fit-content' }}>{c.detail}</a>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--n700)' }}>{c.detail}</p>
              )}
              <span style={{ fontSize: 10, color: 'var(--n400)', letterSpacing: '.06em' }}>{c.note}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--n400)', marginBottom: '.75rem' }}>Follow us</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem' }}>
          {[['Instagram','https://instagram.com/ownyourshape'],['Facebook','https://facebook.com/OwnYourShape'],['X / Twitter','https://twitter.com/ownyourshape']].map(([n,h],i,a) => (
            <React.Fragment key={n}>
              <a href={h} target="_blank" rel="noreferrer" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--n700)', borderBottom: '0.5px solid var(--n300)', paddingBottom: 2 }}>{n}</a>
              {i < a.length - 1 && <span style={{ color: 'var(--n300)' }}>·</span>}
            </React.Fragment>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Contact;
