// require('dotenv').config();
// const express = require('express');
// const app = express();


// app.use(express.json());


// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

// const inventoryRoutes = require('./routes/inventoryRoutes');
// app.use('/api/inventory', inventoryRoutes);

// const PORT = process.env.PORT || 6000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));