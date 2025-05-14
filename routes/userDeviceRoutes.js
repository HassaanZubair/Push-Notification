const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const db = req.app.locals.db;
  const { user_id, device_id } = req.body;

  if (!user_id || !device_id) return res.status(400).json({ message: 'User ID and Device ID are required' });

  try {
    const result = await db.query(
      'INSERT INTO user_devices (user_id, device_id) VALUES ($1, $2) RETURNING *',
      [user_id, device_id]
    );
    res.status(201).json({ message: 'User linked to device', data: result.rows[0] });
  } catch (err) {
    console.error('Error linking user to device:', err);
    res.status(500).json({ message: 'Error linking user to device' });
  }
});

router.get('/', async (req, res) => {
  const db = req.app.locals.db;
  try {
    const result = await db.query(
      `SELECT ud.id, u.name AS user, d.token AS device
       FROM user_devices ud
       JOIN users u ON ud.user_id = u.id
       JOIN devices d ON ud.device_id = d.id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching links' });
  }
});

module.exports = router;
