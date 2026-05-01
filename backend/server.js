const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const redis = require('./src/config/redis');
const db = require('./src/config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/rooms', require('./src/routes/rooms'));
app.use('/api/messages', require('./src/routes/messages'));

// Track online users
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch { next(new Error('Authentication error')); }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.user.id} connected`);
  onlineUsers.set(socket.user.id, socket.id);
  redis.set(`online:${socket.user.id}`, '1', 'EX', 3600);
  io.emit('users:online', Array.from(onlineUsers.keys()));

  socket.on('room:join', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user:joined', { userId: socket.user.id, name: socket.user.name });
  });

  socket.on('message:send', async ({ roomId, content }) => {
    try {
      const [result] = await db.execute(
        'INSERT INTO messages (room_id, sender_id, content) VALUES (?, ?, ?)',
        [roomId, socket.user.id, content]
      );
      const message = {
        id: result.insertId, roomId, content,
        senderId: socket.user.id, senderName: socket.user.name,
        createdAt: new Date()
      };
      await redis.lpush(`messages:${roomId}`, JSON.stringify(message));
      await redis.ltrim(`messages:${roomId}`, 0, 99);
      io.to(roomId).emit('message:receive', message);
    } catch (err) { socket.emit('error', err.message); }
  });

  socket.on('typing:start', ({ roomId }) => {
    socket.to(roomId).emit('typing:start', { userId: socket.user.id, name: socket.user.name });
  });

  socket.on('typing:stop', ({ roomId }) => {
    socket.to(roomId).emit('typing:stop', { userId: socket.user.id });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.user.id);
    redis.del(`online:${socket.user.id}`);
    io.emit('users:online', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`Chat server on port ${PORT}`));
