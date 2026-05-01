const router = require('express').Router();
const db = require('../config/db');
const redis = require('../config/redis');
const { verifyToken } = require('../middleware/auth');

router.get('/:roomId', verifyToken, async (req, res) => {
  try {
    const cached = await redis.lrange(`messages:${req.params.roomId}`, 0, 49);
    if (cached.length) return res.json(cached.map(m => JSON.parse(m)).reverse());
    const [rows] = await db.execute(
      'SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id=u.id WHERE m.room_id=? ORDER BY m.created_at DESC LIMIT 50',
      [req.params.roomId]
    );
    res.json(rows.reverse());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
