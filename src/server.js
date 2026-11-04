require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const path = require('path');

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






// Serve frontend files (index.html, styles.css, etc.) from project root
app.use(express.static(path.join(__dirname, '..')));

// Any non-API route falls back to index.html
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
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
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
