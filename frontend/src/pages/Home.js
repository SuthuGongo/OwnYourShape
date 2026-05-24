import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import API from '../api/axios';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    API.get('/products/featured/')
      .then(({ data }) => setFeatured(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Scroll-reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  return (
    <>
      <Header />
      <main>

        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero__image">
            <div
              className="hero__image-bg"
              style={{ backgroundImage: "url('/image3.jpeg')", backgroundPosition: 'center 15%', backgroundSize: 'cover' }}
            />
            <span className="hero__badge">SS 2025 Collection</span>
          </div>
          <div className="hero__content">
            <p className="hero__eyebrow">New arrivals</p>
            <h1 className="hero__heading">
              Dressed in <em>nothing</em><br />but confidence
            </h1>
            <p className="hero__body">
              Crafted for the woman who knows her beauty is innate — our collection
              celebrates the natural form in every size and every shade.
            </p>
            <div className="hero__actions">
              <Link to="/gymwear" className="btn-primary">Shop Gymwear</Link>
              <Link to="/swimwear" className="btn-ghost">Shop Swimwear</Link>
            </div>
          </div>
        </section>

        {/* ── Categories ── */}
        <section className="home-categories">
          <div className="page-inner">
            <div className="section-header reveal">
              <h2 className="section-title">Collections</h2>
            </div>
            <div className="home-cat-grid">
              <Link to="/gymwear" className="cat-card cat-card--linge reveal-left reveal-d1">
                <div
                  className="cat-card__bg"
                  style={{ backgroundImage: "url('/IMG_1001.jpg')", backgroundPosition: 'center top' }}
                />
                <div className="cat-card__label">
                  <span className="cat-card__name">Gymwear</span>
                  <span className="cat-card__sub">Explore the collection →</span>
                </div>
              </Link>
              <Link to="/swimwear" className="cat-card cat-card--swim reveal-right reveal-d2">
                <div
                  className="cat-card__bg"
                  style={{ backgroundImage: "url('/image64.jpeg')" }}
                />
                <div className="cat-card__label">
                  <span className="cat-card__name">Swimwear</span>
                  <span className="cat-card__sub">Shop now →</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Mood strip ── */}
        <div className="mood-strip">
          <div className="mood-strip__item reveal reveal-d1">
            <div
              className="mood-strip__bg"
              style={{ backgroundImage: "url('/long.jpeg')", backgroundPosition: 'center top' }}
            />
            <span className="mood-strip__caption">Variety</span>
          </div>
          <div className="mood-strip__item mood-strip__item--tall reveal reveal-d2">
            <div
              className="mood-strip__bg"
              style={{ backgroundImage: "url('/4girls.jpeg')", backgroundPosition: 'center top' }}
            />
            <span className="mood-strip__caption">The Collection</span>
          </div>
          <div className="mood-strip__item reveal reveal-d3">
            <div
              className="mood-strip__bg"
              style={{ backgroundImage: "url('/shorts.jpeg')", backgroundPosition: 'center top' }}
            />
            <span className="mood-strip__caption">Less Is More</span>
          </div>
        </div>

        {/* ── Marquee ── */}
        <div className="marquee-strip">
          <div className="marquee-track">
            {['New Arrivals', 'Free Delivery Over R850', 'Gym Wear', 'Easy Returns', 'XS — XXXL', 'New Arrivals', 'Free Delivery Over R850', 'Gym Wear', 'Easy Returns', 'XS — XXXL'].map((t, i) => (
              <span key={i} className="marquee-item">{t}<span className="marquee-sep"> · </span></span>
            ))}
          </div>
        </div>

        {/* ── Featured products ── */}
        {(loading || featured.length > 0) && (
          <section className="home-featured">
            <div className="page-inner">
              <div className="section-header reveal">
                <h2 className="section-title">New arrivals</h2>
                <Link to="/gymwear" className="section-link">View all</Link>
              </div>
              {loading ? (
                <div className="spinner-wrap"><div className="spinner" /></div>
              ) : (
                <div className="home-product-grid">
                  {featured.slice(0, 4).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── USP strip ── */}
        <div className="usp-strip">
          {[
            { icon: 'M5 12h14M12 5l7 7-7 7', title: 'Free Delivery', desc: 'On orders over R850' },
            { icon: 'M23 4 23 10 17 10M20.49 15a9 9 0 11-2.12-9.36L23 10', title: 'Easy Returns', desc: '30-day hassle-free' },
            { icon: 'M3 11h18v11H3zM7 11V7a5 5 0 0110 0v4', title: 'Secure Checkout', desc: 'SSL encrypted' },
            { icon: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z', title: 'Size Guidance', desc: 'XS to XXXL' },
          ].map((u, i) => (
            <div className={`usp-item reveal reveal-d${i + 1}`} key={u.title}>
              <svg className="usp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d={u.icon} />
              </svg>
              <p className="usp-title">{u.title}</p>
              <p className="usp-desc">{u.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Editorial ── */}
        <section className="editorial">
          <div className="editorial__image reveal-left">
            <div
              className="editorial__image-bg"
              style={{ backgroundImage: "url('/image4.jpeg')", backgroundPosition: 'center 25%', backgroundSize: 'cover' }}
            />
          </div>
          <div className="editorial__content reveal-right">
            <p className="editorial__eyebrow">The summer edit</p>
            <h2 className="editorial__heading">
              Made for <em>long days</em><br />by the water
            </h2>
            <p className="editorial__body">
              Our swimwear is built around the idea that beauty needs no effort —
              only the right pieces. Silhouettes made to flatter every body.
            </p>
            <Link to="/swimwear" className="btn-light">Shop Swimwear</Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}