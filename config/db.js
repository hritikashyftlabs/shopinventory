const { Pool } = require('pg');
require('dotenv').config();

// Singleton instance
let instance = null;

class Database {
  constructor() {
    if (instance) {
      return instance;
    }
    
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DBð_PORT,
    });

    this.pool.on('connect', () => {
      console.log('Connected to PostgreSQL DB!');
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    instance = this;
  }

  query(text, params) {
    return this.pool.query(text, params);
  }

  getPool() {
    return this.pool;
  }
}

module.exports = new Database();
