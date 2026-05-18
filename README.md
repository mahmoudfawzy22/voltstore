# VoltStore — Mini E-Commerce App

A full-stack e-commerce application built with React, Node.js/Express, and MongoDB.

---

## Project Structure

```
ecommerce/
├── backend/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── seed.js        # Database seeder (8 sample products)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   ├── middleware/
│   │   └── auth.js        # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── products.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js / .css
    │   │   ├── ProductCard.js / .css
    │   │   └── ProtectedRoute.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── CartContext.js
    │   ├── pages/
    │   │   ├── ProductsPage.js / .css
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── AuthPages.css
    │   │   ├── CartPage.js / .css
    │   │   └── OrdersPage.js / .css
    │   ├── services/
    │   │   └── api.js      # Axios instance + all service calls
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## Prerequisites

- **Node.js** v18+
- **MongoDB** running locally (or a MongoDB Atlas URI)
- **npm** or **yarn**

---

## Setup Instructions

### 1. Clone / Extract the project

```bash
cd ecommerce
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=change_this_to_a_long_random_secret
NODE_ENV=development
```

**Seed the database** (adds 8 sample tech products):

```bash
npm run seed
```

**Start the backend server:**

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The API will run at `http://localhost:5000`

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The React app will open at `http://localhost:3000`

> The frontend proxies `/api` requests to `http://localhost:5000` via the `"proxy"` field in `package.json` — no CORS config needed in development.

---

## API Endpoints

| Method | Endpoint               | Auth | Description              |
|--------|------------------------|------|--------------------------|
| POST   | /api/auth/register     | No   | Register new user        |
| POST   | /api/auth/login        | No   | Login, returns JWT       |
| GET    | /api/auth/me           | Yes  | Get current user         |
| GET    | /api/products          | No   | List all products        |
| GET    | /api/products?search=  | No   | Search products          |
| GET    | /api/products/:id      | No   | Get single product       |
| GET    | /api/cart              | Yes  | Get user cart            |
| POST   | /api/cart              | Yes  | Add item to cart         |
| PUT    | /api/cart/:productId   | Yes  | Update item quantity     |
| DELETE | /api/cart/:productId   | Yes  | Remove item from cart    |
| DELETE | /api/cart              | Yes  | Clear entire cart        |
| POST   | /api/orders            | Yes  | Place new order          |
| GET    | /api/orders/user       | Yes  | Get user order history   |

---

## Features

- **Auth**: Register / Login with JWT. Passwords hashed with bcrypt (salt rounds: 12).
- **Products**: Responsive grid with search, low-stock badge, out-of-stock overlay.
- **Cart**: Add, remove, update quantity. Backed by server-side session per user. Real-time total.
- **Checkout**: Address + phone validation both client and server side. Stock decremented on order.
- **Orders**: Full order history with expandable details, status badge, shipping info.
- **Protected Routes**: Cart and Orders redirect unauthenticated users to `/login`.
- **Loading States**: Spinners and disabled buttons during async operations.
- **Error Handling**: Inline form errors, API error messages, global Express error handler.

---

## Security

- Passwords hashed with `bcryptjs` (12 salt rounds)
- JWT tokens expire after 7 days
- Input validation with `express-validator` on all POST routes
- Auth middleware protects cart and order routes
- Prices re-validated from DB on order placement (prevents price tampering)
- Stock checked server-side before adding to cart and placing orders

---

## Connecting MongoDB Atlas (Cloud)

Replace `MONGO_URI` in `.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
```

---

## Building for Production

```bash
# Frontend
cd frontend
npm run build
# Serves static files from /build

# Backend — serve the React build
# Add this to server.js:
# app.use(express.static(path.join(__dirname, '../frontend/build')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
```
