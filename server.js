const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Ambil connection string dari environment variable Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Penting kalau pakai Supabase/Neon
  }
});

const BRIDGE_SECRET = process.env.BRIDGE_SECRET || 'rahasia_absen_123';

app.post('/api/query', async (req, res) => {
  const clientSecret = req.headers['x-bridge-secret'];
  
  if (clientSecret !== BRIDGE_SECRET) {
    return res.status(403).json({ error: 'Unauthorized: Invalid Bridge Secret' });
  }

  const { query, params } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(query, params || []);
    client.release();
    res.json({ rows: result.rows });
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bridge server running on port ${PORT}`);
});
