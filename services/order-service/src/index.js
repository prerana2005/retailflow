const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/ordersdb';

mongoose.connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => { console.error('MongoDB connection failed:', err); process.exit(1); });

// --- Schema ---
const orderSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  items: [{ product_id: String, quantity: Number, price: Number }],
  total_price: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// --- Routes ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

app.post('/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/orders/user/:user_id', async (req, res) => {
  const orders = await Order.find({ user_id: req.params.user_id });
  res.json(orders);
});

app.listen(3000, () => console.log('Order service running on port 3000'));
