# Dream In Lace — Full Stack Application
## Django Backend + React Frontend

---

## Project Structure

```
dreaminlace/
├── backend/
│   ├── dreaminlace/        # Django project settings, urls, wsgi
│   ├── users/              # CustomUser, auth, wishlist, addresses
│   ├── products/           # Products, categories, variants, reviews
│   ├── orders/             # Orders, order items, promo codes
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── public/index.html
    └── src/
        ├── api/axios.js        # Central API client with JWT refresh
        ├── context/
        │   ├── AuthContext.js  # Auth state, login, logout, register
        │   └── CartContext.js  # Cart state persisted to localStorage
        ├── components/
        │   ├── Header.js/css   # Sticky header, promo strip, mobile drawer
        │   ├── Footer.js/css   # 4-column footer
        │   └── ProductCard.js/css  # Hover overlay, size picker, wishlist
        ├── pages/
        │   ├── Home.js/css         # Hero, categories, featured, editorial
        │   ├── Shop.js/css         # Product grid, search, sort, pagination
        │   ├── ProductDetail.js/css # Gallery, sizes, colours, reviews, related
        │   ├── Cart.js/css         # Cart items, promo, delivery bar, summary
        │   ├── Checkout.js/css     # Shipping form, order summary
        │   ├── OrderConfirm.js     # Order confirmation + payment details
        │   ├── Account.js/css      # Login, Register (3-step), Forgot password
        │   ├── Profile.js          # Orders history, wishlist tabs
        │   ├── Contact.js          # Contact cards, social links
        │   └── NotFound.js         # 404 page
        └── styles/global.css       # CSS variables, resets, shared classes
```

---

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file (optional, has defaults)
echo "SECRET_KEY=your-secret-key-here" > .env
echo "DEBUG=True" >> .env

python manage.py migrate
python manage.py seed_data        # Seeds all 32 products with variants
python manage.py createsuperuser  # Create admin account
python manage.py runserver
```

**Admin panel:** http://localhost:8000/admin

### API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/users/send-verification/ | Send email PIN |
| POST | /api/users/verify-pin/ | Verify PIN |
| POST | /api/users/register/ | Create account |
| POST | /api/users/login/ | Login (returns JWT) |
| POST | /api/users/send-recovery-pin/ | Forgot password PIN |
| POST | /api/users/reset-password/ | Reset password |
| GET/PUT | /api/users/profile/ | User profile (auth) |
| GET/POST | /api/users/wishlist/ | Toggle wishlist (auth) |
| GET | /api/products/ | Product list (filterable, searchable) |
| GET | /api/products/featured/ | Featured products |
| GET | /api/products/{slug}/ | Product detail |
| GET | /api/products/categories/ | All categories |
| POST | /api/products/{slug}/reviews/ | Add review (auth) |
| POST | /api/orders/validate-promo/ | Check promo code |
| POST | /api/orders/ | Place order |
| GET | /api/orders/{order_number}/ | Order detail |
| GET | /api/orders/my-orders/ | User order history (auth) |

### Promo Codes
| Code | Discount |
|------|----------|
| WELCOME | 10% |
| DREAMINLACE | 15% |
| SUMMER25 | 25% |

---

## Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
echo "REACT_APP_RECAPTCHA_KEY=your-recaptcha-key" >> .env

npm start
```

**App runs at:** http://localhost:3000

---

## Adding Product Images

1. Upload images via Django admin → Products → select product → add images
2. OR place images in `backend/media/products/` and create ProductImage records
3. To use local images in frontend, update `main_image_url` references or add a fallback image

The placeholder gradient backgrounds will show until real images are added.

---

## Features Built

### Backend
- JWT authentication with auto-refresh
- Multi-step email verification (PIN-based)
- Password reset via email PIN
- Product variants (size × colour × stock)
- Order management with status tracking
- Promo code validation
- Wishlist per user
- Admin panel with inline product images and variants

### Frontend
- Persistent cart (localStorage)
- JWT token auto-refresh interceptor
- Protected routes (profile redirects to account if not logged in)
- Product card with hover overlay, size quick-select, wishlist toggle
- Product detail with image gallery, sold-out size handling, notify-me modal
- Cart with live promo code validation, free delivery progress bar
- Checkout with full SA address form + validation
- Order confirmation with EFT payment instructions
- 3-step registration (info → email verify → set password)
- Fully responsive — mobile hamburger drawer
- Cormorant Garamond + Jost typography
- Neutral nude colour palette throughout

---

## Deploying to Production

**Backend:** Set `DEBUG=False`, configure PostgreSQL, set `ALLOWED_HOSTS`, configure real email backend (e.g. SendGrid), run `collectstatic`.

**Frontend:** Run `npm run build`, serve the `build/` folder from Nginx or deploy to Vercel/Netlify. Set `REACT_APP_API_URL` to your live API domain.
