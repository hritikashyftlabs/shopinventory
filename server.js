const express = require('express');
const db = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(express.json());

// Initialize database tables
async function initializeDatabase() {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'db', 'init.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL script
    await db.query(sqlScript);
    
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
}

// Initialize database on server start
initializeDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

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

