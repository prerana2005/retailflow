import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Orders({ cart, setCart, user }) {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if(user) {
      axios.get(`/orders/user/${user}`)
        .then(r => setOrders(r.data))
        .catch(() => {});
    }
  }, [user]);

  const total = cart.reduce((sum, p) => sum + p.price, 0);

  function placeOrder() {
    if(!user) { setMsg('Please login first'); return; }
    if(cart.length === 0) { setMsg('Cart is empty'); return; }
    const items = cart.map(p => ({ product_id: String(p.id), quantity: 1, price: p.price }));
    axios.post('/orders', { user_id: user, items, total_price: total })
      .then(r => {
        setOrders([...orders, r.data]);
        setCart([]);
        setMsg('Order placed successfully!');
        axios.post('/notify', { event:'order_created', user_id: user, order_id: r.data._id, email: user+'@example.com' });
      })
      .catch(() => setMsg('Failed to place order'));
  }

  return (
    <div>
      <div className="page-title">Cart & Orders</div>
      {msg && <div className={`msg ${msg.includes('success')?'success':'error'}`}>{msg}</div>}

      <div className="cart-section">
        <h3 style={{marginBottom:'1rem'}}>Your Cart</h3>
        {cart.length === 0 ? <p style={{color:'#888'}}>Cart is empty</p> : (
          <>
            {cart.map((p,i) => (
              <div className="cart-item" key={i}>
                <span>{p.name}</span>
                <span>${p.price}</span>
              </div>
            ))}
            <div className="total">Total: ${total.toFixed(2)}</div>
            <button className="btn btn-primary" style={{marginTop:'1rem',width:'auto',padding:'0.6rem 2rem'}} onClick={placeOrder}>
              Place Order
            </button>
          </>
        )}
      </div>

      <div className="page-title">Order History {user ? `(${user})` : ''}</div>
      {!user && <p style={{color:'#888'}}>Login to see your orders</p>}
      {orders.map(o => (
        <div className="order-card" key={o._id}>
          <h4>Order #{o._id?.slice(-6)}</h4>
          <p style={{fontSize:'0.9rem',color:'#666',margin:'0.3rem 0'}}>
            {o.items?.length} item(s) — ${o.total_price?.toFixed(2)}
          </p>
          <span className={`badge badge-${o.status}`}>{o.status}</span>
        </div>
      ))}
    </div>
  );
}
