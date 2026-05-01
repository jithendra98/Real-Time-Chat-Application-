const router = require('express').Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const [exists] = await db.execute('SELECT id FROM users WHERE email=?', [email]);
    if (exists.length) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute('INSERT INTO users (name, email, password) VALUES (?,?,?)', [name, email, hashed]);
    const token = jwt.sign({ id: result.insertId, name }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: result.insertId, name, email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email=?', [email]);
    if (!rows.length || !await bcrypt.compare(password, rows[0].password))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: rows[0].id, name: rows[0].name }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: rows[0].id, name: rows[0].name } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
