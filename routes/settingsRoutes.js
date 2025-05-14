const express = require("express");
const router = express.Router();
const client = require("../config/db");

// Save Firebase credentials
router.post("/", async (req, res) => {

  const { firebase_project_id, firebase_private_key, firebase_client_email } = req.body;
  const result = await client.query(`

    INSERT INTO settings(firebase_project_id, firebase_private_key, firebase_client_email)
    VALUES($1, $2, $3) RETURNING *`,

    [firebase_project_id, firebase_private_key, firebase_client_email]
  );
  res.json(result.rows[0]);
});

// Get all

router.get("/", async (req, res) => {
  const result = await client.query("SELECT * FROM settings");
  res.json(result.rows);
});

module.exports = router;