# 💬 Real-Time Chat Application

A real-time messaging application built with **Node.js, Socket.io, Express.js, MySQL, Redis, React.js, and Docker**.

## 🚀 Features
- Real-time messaging using **Socket.io** (bi-directional communication)
- Private and group chat rooms
- Live **typing indicators** and read receipts
- JWT-based authentication
- **Redis pub/sub** for multi-instance socket broadcasting and horizontal scalability
- Chat history stored in MySQL, recent messages cached in Redis (last 100 msgs)
- Online/offline user status tracking
- Dockerized for production deployment on AWS EC2

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Socket.io-client |
| Backend | Node.js, Express.js, Socket.io |
| Database | MySQL |
| Cache & Pub/Sub | Redis |
| Auth | JWT (jsonwebtoken), bcryptjs |
| DevOps | Docker, Docker Compose, AWS EC2 |

## 📁 Project Structure
```
├── backend/
│   ├── server.js         # Express + Socket.io server
│   ├── src/
│   │   ├── config/       # DB & Redis config
│   │   ├── middleware/   # JWT auth
│   │   └── routes/       # REST API routes
├── frontend/
│   └── src/
│       ├── components/   # Chat UI components
│       ├── pages/        # React pages
│       └── context/      # Auth & Socket context
├── database.sql
├── Dockerfile
└── docker-compose.yml
```

## ⚙️ Setup & Run

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Database
```bash
mysql -u root -p < database.sql
```

### Docker (Full Stack)
```bash
docker-compose up --build
```

## 📡 Socket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| room:join | Client → Server | Join a chat room |
| message:send | Client → Server | Send a message |
| message:receive | Server → Client | Receive a message |
| typing:start | Client → Server | User started typing |
| typing:stop | Client → Server | User stopped typing |
| users:online | Server → Client | Online users list |

## 📡 REST API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/rooms | Get my rooms |
| POST | /api/rooms | Create room |
| GET | /api/messages/:roomId | Get messages |

## 👨‍💻 Author
**Mallela Jithendra** — [GitHub](https://github.com/jithendra98) | [LinkedIn](https://linkedin.com/in/mallela-jithendra)
