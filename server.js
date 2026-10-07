const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const BRIDGE_SECRET = process.env.BRIDGE_SECRET || 'rahasia_absen_123';

app.post('/api/query', async (req, res) => {
  if (req.headers['x-bridge-secret'] !== BRIDGE_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { query, params } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const client = await pool.connect();
    const result = await client.query(query, params || []);
    client.release();
    res.json({ rows: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Fly.io bridge running on port ${PORT}`));
