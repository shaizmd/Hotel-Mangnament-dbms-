const { Pool } = require('pg');
require('dotenv').config({ path: './.env' }); // Relative path to src/.env from project root

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hotel_booking',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL connected successfully!'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err));

module.exports = pool;