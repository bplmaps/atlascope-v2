import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import cors from 'cors';

dotenv.config();
console.log('Starting server.js');

const app = express();
const port = 3001;

app.use(cors());

console.log("TURSO_API_KEY:", process.env.TURSO_TOURS_KEY);
console.log("TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL);

const turso = createClient({
  authToken: process.env.TURSO_TOURS_KEY,
  url: process.env.TURSO_DATABASE_URL
});

app.get('/api/tours/', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM tours');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
