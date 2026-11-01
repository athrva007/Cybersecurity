require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');


const kycRoutes = require('./routes/kyc');


const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());                // allow requests from the HTML page
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/auth',  authRoutes);
app.use('/api/kyc',   kycRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});



// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
