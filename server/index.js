import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// For testing purposes, we use in-memory sqlite
const dbSource = process.env.NODE_ENV === 'test' ? ':memory:' : 'database.sqlite';
const db = new sqlite3.Database(dbSource);

// Initialize DB schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      unique_12_digit_number TEXT UNIQUE,
      email TEXT,
      password_hash TEXT
    )
  `);
});

export const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// API: Token status
app.get('/api/admin/token-status', (req, res) => {
  db.get('SELECT value FROM settings WHERE key = ?', ['ai_token'], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ hasToken: !!row?.value });
  });
});

// API: Update token
app.post('/api/admin/token', (req, res) => {
  const { token, password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'default_admin_password';

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    ['ai_token', token],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

// Mock results in-memory store
const resultsStore = new Map();

// API: Analyze Files
const upload = multer({ dest: 'uploads/' });
app.post('/api/analyze-files', upload.array('files'), (req, res) => {
  // Mock AI processing that calculates costs
  const area = 150; // Mock derived variable
  const height = 3; // Mock derived variable
  
  const original = area * 120 + height * 400;
  const optimized = area * 105 + height * 360;

  const fullResult = {
    original,
    optimized,
    savings: original - optimized,
    materials: {
      concrete: Math.round(area * 0.15),
      steel: Math.round((area * 2) + (height * 10)),
    },
    variables: { area, height }
  };

  const projectId = uuidv4();
  resultsStore.set(projectId, fullResult);

  // Return only teaser data
  res.status(200).json({
    projectId,
    teaser: {
      original,
      optimized,
    }
  });
});

// Helper to generate 12-digit number
const generate12DigitId = () => {
  let id = '';
  for(let i=0; i<12; i++) {
    id += Math.floor(Math.random() * 10).toString();
  }
  return id;
};

// API: Purchase
app.post('/api/purchase', (req, res) => {
  const { projectId, email, password } = req.body;
  
  if (!resultsStore.has(projectId)) {
    return res.status(404).json({ error: 'Project not found or expired' });
  }

  const fullResult = resultsStore.get(projectId);
  const userId = generate12DigitId();
  const dbId = uuidv4();

  db.run(
    'INSERT INTO users (id, unique_12_digit_number, email, password_hash) VALUES (?, ?, ?, ?)',
    [dbId, userId, email, password], // NOTE: In prod use bcrypt for password_hash!
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json({
        userId,
        fullResult
      });
    }
  );
});

// Export app for testing, start server if not in test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app, db, resultsStore };
