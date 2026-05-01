const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const redis = require('./src/config/redis');
dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/rooms', require('./src/routes/rooms'));
app.use('/api/messages', require('./src/routes/messages'));

// Socket.io with Redis pub/sub
const pub = redis.duplicate();
const sub = redis.duplicate();

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET || 'chat_secret');
    next();
  } catch { next(new Error('Invalid token')); }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name}`);
  onlineUsers.set(socket.user.id, socket.id);
  io.emit('users:online', Array.from(onlineUsers.keys()));

  socket.on('room:join', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('room:user_joined', { user: socket.user.name, roomId });
  });

  socket.on('room:leave', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('room:user_left', { user: socket.user.name });
  });

  socket.on('message:send', async ({ roomId, message }) => {
    const db = require('./src/config/db');
    const [result] = await db.execute(
      'INSERT INTO messages (room_id, sender_id, content) VALUES (?, ?, ?)',
      [roomId, socket.user.id, message]
    );
    const msgData = {
      id: result.insertId,
      roomId,
      message,
      sender: { id: socket.user.id, name: socket.user.name },
      timestamp: new Date()
    };
    // Publish via Redis pub/sub for multi-instance support
    await pub.publish('chat:message', JSON.stringify(msgData));
  });

  socket.on('typing:start', ({ roomId }) => socket.to(roomId).emit('typing:start', { user: socket.user.name }));
  socket.on('typing:stop', ({ roomId }) => socket.to(roomId).emit('typing:stop', { user: socket.user.name }));

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.user.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));
  });
});

// Redis subscriber broadcasts messages to all connected clients
sub.subscribe('chat:message');
sub.on('message', (channel, data) => {
  if (channel === 'chat:message') {
    const msg = JSON.parse(data);
    io.to(msg.roomId).emit('message:receive', msg);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Chat server running on port ${PORT}`));
module.exports = { app, server };
