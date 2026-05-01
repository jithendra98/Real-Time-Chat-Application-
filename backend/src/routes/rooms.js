const router = require('express').Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  const [rows] = await db.execute(
    'SELECT r.* FROM rooms r JOIN room_members rm ON r.id=rm.room_id WHERE rm.user_id=?',
    [req.user.id]
  );
  res.json(rows);
});

router.post('/', verifyToken, async (req, res) => {
  const { name, isGroup } = req.body;
  const [result] = await db.execute('INSERT INTO rooms (name, is_group, created_by) VALUES (?,?,?)', [name, isGroup, req.user.id]);
  await db.execute('INSERT INTO room_members (room_id, user_id) VALUES (?,?)', [result.insertId, req.user.id]);
  res.status(201).json({ id: result.insertId, name });
});

router.post('/:id/join', verifyToken, async (req, res) => {
  await db.execute('INSERT IGNORE INTO room_members (room_id, user_id) VALUES (?,?)', [req.params.id, req.user.id]);
  res.json({ message: 'Joined room' });
});

module.exports = router;
