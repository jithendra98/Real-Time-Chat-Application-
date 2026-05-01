const router = require('express').Router();
const db = require('../config/db');
const redis = require('../config/redis');
const { verifyToken } = require('../middleware/auth');

router.get('/:roomId', verifyToken, async (req, res) => {
  try {
    const cacheKey = `messages:${req.params.roomId}:recent`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
    const [rows] = await db.execute(
      'SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.room_id = ? ORDER BY m.created_at DESC LIMIT 50',
      [req.params.roomId]
    );
    await redis.setex(cacheKey, 60, JSON.stringify(rows.reverse()));
    res.json(rows.reverse());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
