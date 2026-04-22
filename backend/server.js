require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const demandRoutes = require('./routes/demandRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const walletRoutes = require('./routes/walletRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const translateRoutes = require('./routes/translateRoutes');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// FIX 4: Secure CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/demands', demandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/translate', translateRoutes);

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Farm2Factory Backend API is running.',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      orders: '/api/orders'
    }
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Farm2Factory server is running.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
