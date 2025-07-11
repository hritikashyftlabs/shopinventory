const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory');
    res.json({
      status: 200,
      message: 'Items fetched',
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
