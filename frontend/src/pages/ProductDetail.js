import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import API from '../api/axios';
import './ProductDetail.css';

const CARE_ICONS = [
  { icon: '🚿', label: 'Hand wash only' },
  { icon: '❄️',  label: 'Cold water' },
  { icon: '🚫', label: 'No tumble dry' },
  { icon: '✂️',  label: 'Do not bleach' },
];

const SIZE_CHART = [
  { size: 'XS',   bust: '76–81',   waist: '61–66',   hips: '84–89' },
  { size: 'S',    bust: '81–86',   waist: '66–71',   hips: '89–94' },
  { size: 'M',    bust: '86–91',   waist: '71–76',   hips: '94–99' },
  { size: 'L',    bust: '91–96',   waist: '76–81',   hips: '99–104' },
  { size: 'XL',   bust: '96–101',  waist: '81–86',   hips: '104–109' },
  { size: 'XXL',  bust: '101–106', waist: '86–91',   hips: '109–114' },
  { size: 'XXXL', bust: '106–111', waist: '91–96',   hips: '114–119' },
];

const COLOUR_MAP = {
  'Black':      '#1C1C1C',
  'White':      '#F0EDE8',
  'Nude':       '#D4B8A8',
  'Terracotta': '#A0522D',
  'Pink':       '#E8A0C0',
  'Hot Pink':   '#E8448C',
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
  'Purple':     '#4B2D6B',
  'Gold':       '#C9A84C',
};

export default function ProductDetail() {
  const { slug }      = useParams();
  const navigate      = useNavigate();
  const location      = useLocation();
  const { addToCart } = useCart();
  const qColour       = new URLSearchParams(location.search).get('colour') || '';

  const [product, setProduct]       = useState(null);
  const [related, setRelated]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeImg, setActiveImg]   = useState(0);
  const [selSize, setSelSize]       = useState('');
  const [selColour, setSelColour]   = useState('');
  const [qty, setQty]               = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded]           = useState(false);
  const [sizeError, setSizeError]   = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [openAcc, setOpenAcc]       = useState('description');

  useEffect(() => {
    setLoading(true);
    setActiveImg(0); setSelSize(''); setQty(1); setAdded(false);
    API.get(`/products/${slug}/`)
      .then(({ data }) => {
        setProduct(data);
        setWishlisted(data.is_wishlisted || false);
        const colours = [...new Set((data.variants || []).map(v => v.colour).filter(Boolean))];
        const initial = qColour && colours.includes(qColour) ? qColour : (colours[0] || '');
        if (initial) setSelColour(initial);
        API.get(`/products/?category__slug=${data.category?.slug}&ordering=-created_at&page=1`)
          .then(({ data: rd }) => {
            setRelated((rd.results || rd).filter(p => p.slug !== slug).slice(0, 4));
          });
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  // Reset gallery index when colour changes — must be before any early return
  useEffect(() => { setActiveImg(0); }, [selColour]);

  if (loading) return (
    <>
      <Header />
      <div className="spinner-wrap" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
      <Footer />
    </>
  );
  if (!product) return null;

  const allImages = product.images || [];
  const images    = selColour
    ? allImages.filter(img => img.alt_text === selColour)
    : allImages;
  const variants = product.variants || [];
  const sizes    = [...new Set(variants.map(v => v.size))];
  const colours  = [...new Set(variants.filter(v => v.colour).map(v => v.colour))];

  const getVariant = (size, colour) =>
    variants.find(v => v.size === size && (!colour || v.colour === colour));
  const isInStock  = (size) => { const v = getVariant(size, selColour); return v ? v.in_stock : true; };
  const isOnSale   = product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price);
  const avgRating  = product.avg_rating || 0;
  const totalImgs  = Math.max(images.length, 1);

  const handleAddToBag = () => {
    if (!selSize) { setSizeError(true); setTimeout(() => setSizeError(false), 2500); return; }
    addToCart(product, selSize, selColour, qty);
    setAdded(true);
    setTimeout(() => { setAdded(false); navigate('/cart'); }, 1000);
  };

  const handleWishlist = async () => {
    try { await API.post('/users/wishlist/', { product_id: product.id }); } catch {}
    setWishlisted(v => !v);
  };

  const toggleAcc = (key) => setOpenAcc(v => v === key ? '' : key);
  const prevImg   = (e) => { e.stopPropagation(); setActiveImg(i => (i - 1 + totalImgs) % totalImgs); };
  const nextImg   = (e) => { e.stopPropagation(); setActiveImg(i => (i + 1) % totalImgs); };

  const fabricText = product.fabric_care ||
    'Shell: 82% Nylon, 18% Elastane. Lining: 90% Nylon, 10% Elastane. Premium Italian stretch fabric with UPF 50+ sun protection. Chlorine resistant.';
  const sizingText = product.sizing_fit ||
    'This style fits true to size. If between sizes, size up for a more relaxed fit. Model is 175cm and wears size S.';

  return (
    <>
      <Header />

      <div className="breadcrumb">
        <span className="bc" onClick={() => navigate('/')}>Home</span>
        <span className="bc-sep">›</span>
        <span className="bc" onClick={() => navigate(`/${product.category?.slug || 'swimwear'}`)}>{product.category?.name || 'Swimwear'}</span>
        <span className="bc-sep">›</span>
        <span className="bc cur">{product.name}</span>
      </div>

      <main className="pd-wrap">
        <div className="pd-layout">

          {/* ── Gallery ── */}
          <div className="pd-gallery">
            <div className="pd-gallery__thumbs">
              {images.length > 0
                ? images.map((img, i) => (
                    <button key={img.id} className={`pd-thumb${activeImg === i ? ' on' : ''}`} onClick={() => setActiveImg(i)}>
                      <img src={img.image_url} alt={img.alt_text || product.name} />
                    </button>
                  ))
                : ['Front', 'Back', 'Detail', 'Side'].map((l, i) => (
                    <button key={l} className={`pd-thumb pd-thumb--ph${activeImg === i ? ' on' : ''}`} onClick={() => setActiveImg(i)}>
                      <span>{l}</span>
                    </button>
                  ))
              }
            </div>

            <div className="pd-gallery__main">
              <div className="pd-gallery__img-container">
                {images.length > 0
                  ? <img src={images[activeImg]?.image_url} alt={images[activeImg]?.alt_text || product.name} className="pd-gallery__img" />
                  : <div className="pd-gallery__placeholder">{product.name}</div>
                }
              </div>
              <button className="pd-gallery__nav pd-gallery__nav--prev" onClick={prevImg} aria-label="Previous">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <button className="pd-gallery__nav pd-gallery__nav--next" onClick={nextImg} aria-label="Next">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <span className="pd-gallery__counter">{activeImg + 1} / {totalImgs}</span>
            </div>
          </div>

          {/* ── Info Panel ── */}
          <div className="pd-info">
            <div className="pd-info__top">
              <p className="pd-info__eyebrow">Dream In Lace · {product.category?.name}</p>
              <button className="pd-share" onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Share
              </button>
            </div>

            <h1 className="pd-info__name">{product.name}</h1>

            {product.review_count > 0 && (
              <div className="pd-rating">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24" className={`pd-star${s <= Math.round(avgRating) ? ' on' : ''}`}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                <span className="pd-rating__count">{product.review_count} reviews</span>
              </div>
            )}

            <div className="pd-price-row">
              <span className="pd-price">R {parseFloat(product.price).toLocaleString()}</span>
              {isOnSale && <span className="pd-price-was">R {parseFloat(product.compare_at_price).toLocaleString()}</span>}
              {isOnSale && <span className="pd-price-save">Save {product.discount_percent}%</span>}
            </div>

            {colours.length > 0 && (
              <>
                <div className="pd-field-label">Colour <span>{selColour}</span></div>
                <div className="pd-colours">
                  {colours.map(c => (
                    <button key={c} className={`pd-swatch${selColour === c ? ' on' : ''}`}
                      style={{ background: COLOUR_MAP[c] || '#b8a08a' }} title={c}
                      onClick={() => setSelColour(c)} />
                  ))}
                </div>
              </>
            )}

            <div className={`pd-field-label${sizeError ? ' error' : ''}`}>
              Size {selSize && <span>{selSize}</span>}
              {sizeError && <span className="pd-size-error">Please select a size</span>}
            </div>
            <div className="pd-sizes">
              {sizes.map(s => {
                const inStock = isInStock(s);
                return (
                  <button key={s}
                    className={`pd-sz${selSize === s ? ' on' : ''}${!inStock ? ' out' : ''}`}
                    onClick={() => inStock ? setSelSize(s) : setNotifyOpen(true)}
                  >{s}</button>
                );
              })}
            </div>
            <button className="pd-size-guide">Size guide →</button>

            <div className="pd-field-label" style={{ marginBottom: '.5rem' }}>Quantity</div>
            <div className="pd-qty">
              <button className="pd-qty__btn" onClick={() => setQty(v => Math.max(1, v - 1))}>−</button>
              <span className="pd-qty__val">{qty}</span>
              <button className="pd-qty__btn" onClick={() => setQty(v => v + 1)}>+</button>
            </div>

            <div className="pd-cta">
              <button className={`pd-add-btn${added ? ' added' : ''}`} onClick={handleAddToBag}>
                {added ? 'Added ✓  Going to bag…' : 'Add to Bag'}
              </button>
              <button className={`pd-wish-btn${wishlisted ? ' on' : ''}`} onClick={handleWishlist} aria-label="Wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </button>
            </div>

            {/* Trust bar — proper separate SVGs */}
            <div className="pd-trust">
              <div className="pd-trust__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h4l3 5v3h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <div><p className="pd-trust__title">Free delivery</p><p className="pd-trust__sub">Over R850</p></div>
              </div>
              <div className="pd-trust__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
                <div><p className="pd-trust__title">30-day returns</p><p className="pd-trust__sub">Easy &amp; free</p></div>
              </div>
              <div className="pd-trust__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="3" y="11" width="18" height="11" rx="1"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <div><p className="pd-trust__title">Secure checkout</p><p className="pd-trust__sub">SSL encrypted</p></div>
              </div>
            </div>

            {/* Accordion */}
            <div className="pd-accordion">
              {product.description && (
                <div className="pd-acc__row">
                  <button className={`pd-acc__head${openAcc === 'description' ? ' open' : ''}`} onClick={() => toggleAcc('description')}>
                    Description
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pd-acc__arrow"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {openAcc === 'description' && <div className="pd-acc__body">{product.description}</div>}
                </div>
              )}

              <div className="pd-acc__row">
                <button className={`pd-acc__head${openAcc === 'fabric' ? ' open' : ''}`} onClick={() => toggleAcc('fabric')}>
                  Fabric &amp; Care
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pd-acc__arrow"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {openAcc === 'fabric' && (
                  <div className="pd-acc__body">
                    <div className="pd-care-grid">
                      {CARE_ICONS.map(c => (
                        <div className="pd-care-item" key={c.label}>
                          <span className="pd-care-item__icon">{c.icon}</span>
                          <span className="pd-care-item__label">{c.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pd-fabric-detail">
                      <div className="pd-fabric-row"><span className="pd-fabric-row__label">Composition</span><span className="pd-fabric-row__val">82% Nylon · 18% Elastane</span></div>
                      <div className="pd-fabric-row"><span className="pd-fabric-row__label">Lining</span><span className="pd-fabric-row__val">90% Nylon · 10% Elastane</span></div>
                      <div className="pd-fabric-row"><span className="pd-fabric-row__label">UV Protection</span><span className="pd-fabric-row__val">UPF 50+</span></div>
                      <div className="pd-fabric-row"><span className="pd-fabric-row__label">Chlorine resistant</span><span className="pd-fabric-row__val">Yes</span></div>
                    </div>
                    <p style={{ marginTop: '10px' }}>{fabricText}</p>
                  </div>
                )}
              </div>

              <div className="pd-acc__row">
                <button className={`pd-acc__head${openAcc === 'sizing' ? ' open' : ''}`} onClick={() => toggleAcc('sizing')}>
                  Sizing &amp; Fit
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pd-acc__arrow"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {openAcc === 'sizing' && (
                  <div className="pd-acc__body">
                    <p style={{ marginBottom: '12px' }}>{sizingText}</p>
                    <table className="pd-size-table">
                      <thead><tr><th>Size</th><th>Bust (cm)</th><th>Waist (cm)</th><th>Hips (cm)</th></tr></thead>
                      <tbody>
                        {SIZE_CHART.map(row => (
                          <tr key={row.size} style={selSize === row.size ? { background: 'var(--n100, #f5f3ef)' } : {}}>
                            <td style={{ fontWeight: selSize === row.size ? '500' : '300' }}>{row.size}</td>
                            <td>{row.bust}</td><td>{row.waist}</td><td>{row.hips}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pd-acc__row">
                <button className={`pd-acc__head${openAcc === 'delivery' ? ' open' : ''}`} onClick={() => toggleAcc('delivery')}>
                  Delivery &amp; Returns
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pd-acc__arrow"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {openAcc === 'delivery' && (
                  <div className="pd-acc__body">
                    <div className="pd-fabric-detail">
                      <div className="pd-fabric-row"><span className="pd-fabric-row__label">Standard delivery</span><span className="pd-fabric-row__val">R95 · 3–5 working days</span></div>
                      <div className="pd-fabric-row"><span className="pd-fabric-row__label">Free delivery</span><span className="pd-fabric-row__val">Orders over R850</span></div>
                      <div className="pd-fabric-row"><span className="pd-fabric-row__label">Returns</span><span className="pd-fabric-row__val">30 days · free &amp; easy</span></div>
                    </div>
                    <p style={{ marginTop: '10px' }}>Items must be unworn with all tags attached. Swimwear must have hygiene liner intact to qualify for return.</p>
                  </div>
                )}
              </div>
            </div>

            {product.reviews?.length > 0 && (
              <div className="pd-reviews">
                <p className="pd-reviews__title">Customer Reviews</p>
                {product.reviews.map(r => (
                  <div className="pd-review" key={r.id}>
                    <div className="pd-review__top">
                      <span className="pd-review__name">{r.user_name}</span>
                      <span className="pd-review__rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.comment && <p className="pd-review__comment">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="pd-related">
            <div className="page-inner">
              <div className="section-header">
                <h2 className="section-title">You may also like</h2>
                <Link to={`/${product.category?.slug || 'swimwear'}`} className="section-link">View all</Link>
              </div>
              <div className="pd-related__grid">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        )}
      </main>

      {notifyOpen && (
        <div className="pd-modal-overlay" onClick={() => setNotifyOpen(false)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <h2 className="pd-modal__title">Notify me</h2>
            <p className="pd-modal__sub">Enter your email and we'll let you know when this size is back in stock.</p>
            <input className="field__input" type="email" placeholder="your@email.com" />
            <button className="btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setNotifyOpen(false)}>Notify Me</button>
            <button className="pd-modal__close" onClick={() => setNotifyOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}