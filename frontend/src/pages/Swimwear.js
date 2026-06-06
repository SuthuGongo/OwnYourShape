import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API from '../api/axios';
import './Swimwear.css';

const FILTERS = [
  { label: 'All',       value: 'all',       keywords: [] },
  { label: 'Bikinis',   value: 'bikinis',   keywords: ['bikini'] },
  { label: 'Sets',      value: 'sets',      keywords: ['set'] },
  { label: 'One-Piece', value: 'one-piece', keywords: ['one-piece', 'one piece', 'onepiece', 'swimsuit', 'monokini'] },
  { label: 'Dresses',   value: 'dresses',   keywords: ['dress', 'kaftan', 'cover', 'sarong'] },
];

const SORT_OPTIONS = [
  { label: 'Featured',    value: '-is_featured' },
  { label: 'Newest',      value: '-created_at' },
  { label: 'Price: Low',  value: 'price' },
  { label: 'Price: High', value: '-price' },
];

export default function Swimwear() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState('all');
  const [sort, setSort]         = useState('-is_featured');
  const [search, setSearch]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    API.get(`/products/?category__slug=swimwear&ordering=${sort}&page_size=100`)
      .then(({ data }) => setProducts(data.results ?? data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sort]);

  const activeFilter = FILTERS.find(f => f.value === active);

  const filtered = products.filter(p => {
    const nameLower = p.name.toLowerCase();
    const matchSearch = !search || nameLower.includes(search.toLowerCase());
    const matchFilter =
      active === 'all' ||
      (activeFilter?.keywords ?? []).some(kw => nameLower.includes(kw));
    return matchSearch && matchFilter;
  });

  const goToProduct = (slug) => navigate(`/products/${slug}`);

  return (
    <>
      <Header />
      <main className="sw-page">

        <div className="sw-page-header">
          <div>
            <h1 className="sw-page-title">Swimwear Collection</h1>
            <p className="sw-page-count">{filtered.length} pieces</p>
          </div>
          <div className="sw-page-controls">
            <div className="sw-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="sw-search__input"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="sw-sort">
              <span className="sw-sort__label">Sort</span>
              <select
                className="sw-sort__select"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="sw-filter-bar">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`sw-filter-btn${active === f.value ? ' active' : ''}`}
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
          <div className="sw-empty">
            <p>No products found{search ? ` for "${search}"` : ''}.</p>
            {(search || active !== 'all') && (
              <button className="btn-ghost" onClick={() => { setSearch(''); setActive('all'); }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="sw-grid">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                className="sw-card"
                onClick={() => goToProduct(p.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && goToProduct(p.slug)}
              >
                <div className="sw-card__img-wrap">
                  <div className="sw-card__img-inner">
                    {p.main_image_url ? (
                      <img
                        className="sw-card__img"
                        src={p.main_image_url}
                        alt={p.name}
                        loading={i < 8 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <div className="sw-card__placeholder">{p.name}</div>
                    )}
                  </div>

                  {p.compare_at_price && parseFloat(p.compare_at_price) > parseFloat(p.price) && (
                    <span className="sw-badge sw-badge--sale">Sale</span>
                  )}
                  {p.is_featured && !(p.compare_at_price && parseFloat(p.compare_at_price) > parseFloat(p.price)) && (
                    <span className="sw-badge sw-badge--new">New</span>
                  )}

                  <button
                    className="sw-wish"
                    onClick={e => e.stopPropagation()}
                    aria-label="Wishlist"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>

                  <div className="sw-card__hover">
                    {p.variants?.length > 0 && (
                      <div className="sw-card__sizes">
                        {[...new Set(p.variants.map(v => v.size))].map(s => (
                          <span key={s} className="sw-card__sz">{s}</span>
                        ))}
                      </div>
                    )}
                    <button
                      className="sw-card__add"
                      onClick={e => { e.stopPropagation(); goToProduct(p.slug); }}
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>

                <div className="sw-card__info">
                  <p className="sw-card__name">{p.name}</p>
                  <div className="sw-card__prices">
                    {p.compare_at_price && parseFloat(p.compare_at_price) > parseFloat(p.price) && (
                      <span className="sw-card__was">R {parseFloat(p.compare_at_price).toLocaleString()}</span>
                    )}
                    <span className="sw-card__price">R {parseFloat(p.price).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}