const express = require("express");
const router = express.Router();
const client = require("../config/db");

// Create User
router.post("/", async (req, res) => {
  const { name, email } = req.body;
  const result = await client.query("INSERT INTO users(name, email) VALUES($1, $2) RETURNING *", [name, email]);
  res.json(result.rows[0]);
});

// Get All Users
router.get("/", async (req, res) => {
  const result = await client.query("SELECT * FROM users");
  res.json(result.rows);
});

module.exports = router;