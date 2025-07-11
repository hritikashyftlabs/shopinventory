const express = require('express');
const pool = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');  
const app = express();
app.use(express.json());



app.use('/api/auth', authRoutes);  
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 200,
      message: 'Connected to PostgreSQL!',
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: 'Connection failed',
      error: err.message
    });
  }
});


app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});