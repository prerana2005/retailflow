const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('redis');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const users = {};

let redisClient;
let redisReady = false;

async function connectRedis() {
  redisClient = createClient({ 
    url: REDIS_URL,
    socket: { reconnectStrategy: retries => Math.min(retries * 100, 3000) }
  });
  redisClient.on('error', err => console.error('Redis error:', err.message));
  redisClient.on('ready', () => { redisReady = true; console.log('Connected to Redis'); });
  await redisClient.connect().catch(err => console.error('Redis connect failed:', err.message));
}
connectRedis();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service', redis: redisReady });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'username and password required' });
  if (users[username])
    return res.status(409).json({ error: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  users[username] = { username, password: hashed };
  res.status(201).json({ message: 'User registered', username });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  if (redisReady) {
    await redisClient.setEx(`session:${username}`, 3600, token);
  }
  res.json({ token });
});

app.get('/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ username: decoded.username, message: 'Profile accessed' });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(4000, () => console.log('User service running on port 4000'));
