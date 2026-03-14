import React, { useState } from 'react';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Auth from './pages/Auth';
import './App.css';

export default function App() {
  const [page, setPage] = useState('products');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  return (
    <div className="app">
      <nav className="navbar">
        <span className="brand">RetailFlow</span>
        <div className="nav-links">
          <button onClick={() => setPage('products')} className={page==='products'?'active':''}>Products</button>
          <button onClick={() => setPage('orders')} className={page==='orders'?'active':''}>Orders</button>
          <button onClick={() => setPage('auth')} className={page==='auth'?'active':''}>
            {user ? user : 'Login'}
          </button>
        </div>
        <span className="cart-count">Cart: {cart.length}</span>
      </nav>

      <main className="main">
        {page === 'products' && <Products cart={cart} setCart={setCart} />}
        {page === 'orders' && <Orders cart={cart} setCart={setCart} user={user} />}
        {page === 'auth' && <Auth user={user} setUser={setUser} />}
      </main>
    </div>
  );
}
