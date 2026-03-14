import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Products({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name:'', description:'', price:'', stock:'' });

  useEffect(() => {
    axios.get('/products')
      .then(r => { setProducts(r.data); setLoading(false); })
      .catch(() => { setMsg('Cannot connect to product-service'); setLoading(false); });
  }, []);

  function addToCart(p) {
    setCart([...cart, p]);
    setMsg(`${p.name} added to cart`);
    setTimeout(() => setMsg(''), 2000);
  }

  function addProduct(e) {
    e.preventDefault();
    axios.post('/products', { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) })
      .then(r => { setProducts([...products, r.data]); setForm({ name:'', description:'', price:'', stock:'' }); })
      .catch(() => setMsg('Failed to add product'));
  }

  return (
    <div>
      <div className="page-title">Product Catalog</div>
      {msg && <div className="msg success">{msg}</div>}

      <div className="add-form">
        <h3>Add New Product</h3>
        <form onSubmit={addProduct}>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required />
          <input placeholder="Stock" type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} required />
          <button type="submit" className="btn btn-secondary">Add Product</button>
        </form>
      </div>

      {loading ? <p>Loading products...</p> : (
        <div className="grid">
          {products.length === 0 && <p>No products yet. Add one above.</p>}
          {products.map(p => (
            <div className="card" key={p.id}>
              <h3>{p.name}</h3>
              <p style={{fontSize:'0.85rem',color:'#666',marginBottom:'0.5rem'}}>{p.description}</p>
              <div className="price">${p.price}</div>
              <div className="stock">Stock: {p.stock}</div>
              <button className="btn btn-primary" onClick={() => addToCart(p)}>Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
