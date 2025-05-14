const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const db = req.app.locals.db;
  const { firebase_project_id, firebase_private_key, firebase_client_email } = req.body;

  if (!firebase_project_id || !firebase_private_key || !firebase_client_email) {
    return res.status(400).json({ message: 'All Firebase settings are required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO settings(firebase_project_id, firebase_private_key, firebase_client_email) VALUES($1, $2, $3) RETURNING *',
      [firebase_project_id, firebase_private_key, firebase_client_email]
    );
    res.status(201).json({ message: 'Settings saved', data: result.rows[0] });
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ message: 'Error saving settings' });
  }
});

router.get('/', async (req, res) => {
  const db = req.app.locals.db;
  try {
    const result = await db.query('SELECT * FROM settings');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

module.exports = router;
