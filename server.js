const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check endpoint
app.get('/ping', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
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

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

