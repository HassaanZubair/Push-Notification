const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const db = req.app.locals.db;
  const { token, type } = req.body;

  if (!token) return res.status(400).json({ message: 'Token is required' });

  try {
    const result = await db.query(
      'INSERT INTO devices (token, type) VALUES ($1, $2) ON CONFLICT (token) DO NOTHING RETURNING *',
      [token, type || 'web']
    );
    res.status(201).json({ message: 'Token saved', data: result.rows[0] || {} });
  } catch (err) {
    console.error('Error saving token:', err);
    res.status(500).json({ message: 'Error saving token' });
  }
});

module.exports = router;
