const express = require("express");
const router = express.Router();
const client = require("../config/db");

// Link user and device
router.post("/", async (req, res) => {
  const { user_id, device_id } = req.body;
  const result = await client.query("INSERT INTO user_devices(user_id, device_id) VALUES($1, $2) RETURNING *", [user_id, device_id]);
  res.json(result.rows[0]);
});

// Get All Links
router.get("/", async (req, res) => {
  
  const result = await client.query(`
    SELECT ud.id, u.name AS user, d.token AS device
    FROM user_devices ud
    JOIN users u ON ud.user_id = u.id
    JOIN devices d ON ud.device_id = d.id
  `);
  res.json(result.rows);
});

module.exports = router;