# 💬 Real-Time Chat Application

A real-time messaging application built with **Node.js, Socket.io, MySQL, Redis, and React.js**.

## 🚀 Features
- Real-time messaging with Socket.io (bi-directional events)
- Live typing indicators and online user presence
- Group rooms and private channels
- Chat history stored in MySQL, recent messages cached in Redis
- Redis pub/sub for horizontal scaling across multiple server instances
- JWT-based authentication for secure socket connections
- Dockerized for easy cloud deployment on AWS EC2

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Real-Time | Socket.io |
| Database | MySQL |
| Cache & Pub/Sub | Redis |
| Auth | JWT |
| Frontend | React.js |
| DevOps | Docker, Docker Compose |

## 📁 Project Structure
```
├── server.js          # Express + Socket.io server
├── database.sql
├── Dockerfile
├── docker-compose.yml
├── src/
│   ├── config/        # DB & Redis config
│   ├── middleware/    # JWT auth
│   └── routes/        # Auth, rooms, messages
└── public/            # React frontend
```

## ⚙️ Setup & Run
```bash
git clone https://github.com/jithendra98/Real-Time-Chat-Application-.git
cd Real-Time-Chat-Application-
npm install
cp .env.example .env
mysql -u root -p < database.sql
npm run dev
```

## 📡 API & Socket Events
| Type | Event/Endpoint | Description |
|------|---------------|-------------|
| REST | POST /api/auth/register | Register user |
| REST | GET /api/messages/:roomId | Get chat history |
| Socket | message:send | Send a message |
| Socket | message:receive | Receive a message |
| Socket | typing:start / stop | Typing indicator |
| Socket | users:online | Online users list |

## 👨‍💻 Author
**Mallela Jithendra** — [GitHub](https://github.com/jithendra98) | [LinkedIn](https://linkedin.com/in/mallela-jithendra)
