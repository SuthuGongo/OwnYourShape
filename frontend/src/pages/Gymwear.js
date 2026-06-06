import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API from '../api/axios';
import './Gymwear.css';

const COLOUR_MAP = {
  'Black':      '#1C1C1C',
  'White':      '#F0EDE8',
  'Nude':       '#D4B8A8',
  'Terracotta': '#A0522D',
  'Pink':       '#E8A0C0',
  'Baby Blue':  '#A8C8E8',
  'Teal':       '#6BADA0',
  'Sage':       '#7AAA8C',
  'Coral':      '#D4704A',
  'Navy':       '#2A3A5A',
  'Lavender':   '#B8A8D4',
  'Red':        '#C04040',
  'Olive':      '#7A8A4A',
  'Charcoal':   '#4A4A4A',
  'Dusty Rose': '#D4A0A8',
  'Sky Blue':   '#88BBD4',
  'Mint':       '#88C8B0',
  'Sand':       '#D4C4A0',
  'Burgundy':   '#7A2040',
};

// Each filter has a list of keywords matched against product name (lowercase).
// This is the fix — your Product model has no subcategory or tags field,
// so we match against the name instead.
const FILTERS = [
  { label: 'All',         value: 'all',         keywords: [] },
  { label: 'Dresses',     value: 'dresses',     keywords: ['dress', 'romper'] },
  { label: 'Leggings',    value: 'leggings',    keywords: ['legging'] },
  { label: 'Sports Bras', value: 'sports-bras', keywords: ['bra', 'sports bra', 'sport bra'] },
  { label: 'Tops',        value: 'tops',        keywords: ['top', 'crop', 'tank', 'shirt', 'tee'] },
  { label: 'Sets',        value: 'sets',        keywords: ['set'] },
];

const SORT_OPTIONS = [
  { label: 'Featured',    value: '-is_featured' },
  { label: 'Newest',      value: '-created_at' },
  { label: 'Price: Low',  value: 'price' },
  { label: 'Price: High', value: '-price' },
];

function GymCard({ product }) {
  const navigate = useNavigate();

  const colours = [...new Set(
    (product.variants || []).map(v => v.colour).filter(Boolean)
  )];

  const [activeColour, setActiveColour] = useState(colours[0] || '');

  const allImages   = product.images || [];
  const colourImage = allImages.find(img => img.alt_text === activeColour);
  const displaySrc  = colourImage?.image_url || product.main_image_url || null;

  const sizesForColour = [...new Set(
    (product.variants || [])
      .filter(v => !activeColour || v.colour === activeColour)
      .map(v => v.size)
  )];

  const isOnSale = product.compare_at_price &&
    parseFloat(product.compare_at_price) > parseFloat(product.price);

  const goToProduct = () =>
    navigate(`/products/${product.slug}${activeColour ? `?colour=${encodeURIComponent(activeColour)}` : ''}`);

  return (
    <div
      className="gw-card"
      onClick={goToProduct}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && goToProduct()}
    >
      <div className="gw-card__img-wrap">
        <div className="gw-card__img-inner">
          {displaySrc
            ? <img className="gw-card__img" src={displaySrc} alt={product.name} loading="lazy" />
            : <div className="gw-card__placeholder">{product.name}</div>
          }
        </div>

        {isOnSale && <span className="gw-badge gw-badge--sale">Sale</span>}
        {product.is_featured && !isOnSale && <span className="gw-badge gw-badge--new">New</span>}

        <button className="gw-wish" onClick={e => e.stopPropagation()} aria-label="Add to wishlist">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <div className="gw-card__hover">
          {sizesForColour.length > 0 && (
            <div className="gw-card__sizes">
              {sizesForColour.map(s => <span key={s} className="gw-card__sz">{s}</span>)}
            </div>
          )}
          <button
            className="gw-card__add"
            onClick={e => { e.stopPropagation(); goToProduct(); }}
          >
            Select Options
          </button>
        </div>
      </div>

      <div className="gw-card__info">
        <p className="gw-card__name">{product.name}</p>

        {colours.length > 0 && (
          <div className="gw-card__swatches" onClick={e => e.stopPropagation()}>
            {colours.map(c => (
              <button
                key={c}
                className={`gw-swatch${activeColour === c ? ' on' : ''}`}
                style={{ background: COLOUR_MAP[c] || '#ccc' }}
                title={c}
                onClick={e => { e.stopPropagation(); setActiveColour(c); }}
                aria-label={c}
              />
            ))}
            {colours.length > 1 && (
              <span className="gw-swatch-count">{colours.length} colours</span>
            )}
          </div>
        )}

        <div className="gw-card__prices">
          {isOnSale && (
            <span className="gw-card__was">R {parseFloat(product.compare_at_price).toLocaleString()}</span>
          )}
          <span className="gw-card__price">R {parseFloat(product.price).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function Gymwear() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState('all');
  const [sort, setSort]         = useState('-is_featured');
  const [search, setSearch]     = useState('');

  // Fetch all gymwear once per sort change — filtering is purely client-side
  useEffect(() => {
    setLoading(true);
    API.get(`/products/?category__slug=gymwear&ordering=${sort}&page_size=100`)
      .then(({ data }) => setProducts(data.results ?? data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sort]);

  const activeFilter = FILTERS.find(f => f.value === active);

  const filtered = products.filter(p => {
    const nameLower = p.name.toLowerCase();

    // Search match
    const matchSearch = !search || nameLower.includes(search.toLowerCase());

    // Category tab match — keywords against product name
    const matchFilter =
      active === 'all' ||
      (activeFilter?.keywords ?? []).some(kw => nameLower.includes(kw));

    return matchSearch && matchFilter;
  });

  return (
    <>
      <Header />
      <main className="gw-page">

        <div className="gw-page-header">
          <div>
            <h1 className="gw-page-title">Gymwear Collection</h1>
            <p className="gw-page-count">{filtered.length} pieces</p>
          </div>
          <div className="gw-page-controls">
            <div className="gw-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="gw-search__input"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="gw-sort">
              <span className="gw-sort__label">Sort</span>
              <select className="gw-sort__select" value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="gw-filter-bar">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`gw-filter-btn${active === f.value ? ' active' : ''}`}
              onClick={() => setActive(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-wrap" style={{ minHeight: '40vh' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="gw-empty">
            <p>No products found{search ? ` for "${search}"` : ''}.</p>
            {(search || active !== 'all') && (
              <button className="btn-ghost" onClick={() => { setSearch(''); setActive('all'); }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="gw-grid">
            {filtered.map(p => <GymCard key={p.id} product={p} />)}
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}