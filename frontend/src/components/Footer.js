import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">Own Your Shape</Link>
            <p className="footer-desc">
              Refined gymwear and swimwear for women who move through the world with grace.
              Designed and delivered across South Africa.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com/ownyourshape" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://facebook.com/OwnYourShape" target="_blank" rel="noreferrer">Facebook</a>
              <a href="https://twitter.com/ownyourshape"  target="_blank" rel="noreferrer">X / Twitter</a>
            </div>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Shop</p>
            <ul>
              <li><Link to="/gymwear">Gymwear</Link></li>
              <li><Link to="/swimwear">Swimwear</Link></li>
              <li><Link to="/cart">Your Bag</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Help</p>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><a href="#size-guide">Size Guide</a></li>
              <li><a href="#shipping">Shipping Info</a></li>
              <li><a href="#returns">Returns</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Contact</p>
            <ul>
              <li><a href="mailto:info@ownyourshape.com">info@ownyourshape.com</a></li>
              <li><a href="https://wa.me/27780554190" target="_blank" rel="noreferrer">+27 78 055 4190 (WhatsApp)</a></li>
              <li className="footer-hours">Mon–Fri: 9am – 6pm</li>
              <li className="footer-hours">Sat: 10am – 3pm</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} Own Your Shape. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
