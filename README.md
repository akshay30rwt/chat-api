# Real-Time Chat API

A production-ready REST + real-time API for one-to-one messaging
built with Node.js, Express.js, MongoDB and Socket.io.

## Features
- User registration and login with JWT authentication
- Real-time bidirectional messaging via Socket.io
- Online/offline status tracking
- Persistent message history stored in MongoDB
- Chat history retrieval via REST endpoint
- Security hardened with Helmet, CORS, rate limiting
- Request logging with Morgan
- Global error handling with custom AppError class
- Request validation with Joi
- Production-level folder structure (src/)

## Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io
- JWT (jsonwebtoken)
- bcryptjs
- Helmet
- CORS
- Morgan
- express-rate-limit
- Joi
- dotenv

## Folder Structure
```
chat-api/
├── src/
│   ├── config/
│   │   └── db.js                - MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    - Auth business logic
│   │   └── messageController.js - Chat history logic
│   ├── middleware/
│   │   ├── authMiddleware.js    - JWT verification
│   │   ├── errorHandler.js      - Global error handler
│   │   └── validate.js          - Joi validation middleware
│   ├── models/
│   │   ├── User.js              - User schema with isOnline status
│   │   └── Message.js           - Message schema with sender/receiver
│   ├── routes/
│   │   ├── authRoutes.js        - Auth routes
│   │   └── messageRoutes.js     - Chat history route
│   ├── sockets/
│   │   └── chatSocket.js        - Socket.io real-time logic
│   ├── utils/
│   │   └── AppError.js          - Custom error class
│   ├── validators/
│   │   └── authValidator.js     - Joi validation schemas
│   └── app.js                   - Express app setup
├── .env                         - Environment variables
├── .gitignore
├── package.json
└── server.js                    - Entry point (HTTP + Socket.io server)
```

## Environment Variables
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/chatdb
JWT_SECRET=your_jwt_secret

## Getting Started
1. Clone the repository
2. Run npm install
3. Create a .env file using the Environment Variables section above
4. Make sure MongoDB is running locally
5. Run npm run dev

## How to Run
```
npm install
npm run dev
```

## REST API Endpoints

### Auth Routes
POST   /auth/register
       Body: { name, email, password }
       Register a new user

POST   /auth/login
       Body: { email, password }
       Login and receive JWT token and userId

GET    /auth/users             (protected)
       Get all registered users except yourself
       Returns: name, email, isOnline for each user

### Message Routes
GET    /messages/:userId       (protected)
       Get full chat history between you and the specified user
       Sorted oldest to newest

## Authentication
Protected REST routes require JWT token in header:
Authorization: Bearer <token>

Socket.io connections require JWT token in the handshake auth:
const socket = io('http://localhost:3000', {
    auth: { token: 'your_jwt_token' }
});

## Socket.io Events

### Client → Server
sendMessage
Payload: { receiverId, content }
Sends a message to another user. Message is saved to MongoDB
and delivered instantly if the receiver is online.

### Server → Client
receiveMessage
Payload: { senderId, content, createdAt }
Fired when a new message arrives for the connected user.

## Real-Time Flow
1. Client connects with JWT token in socket handshake
2. Server verifies token, marks user as online
3. Client emits 'sendMessage' with receiverId and content
4. Server saves message to MongoDB
5. If receiver is online, server emits 'receiveMessage' to them instantly
6. If receiver is offline, message stays in MongoDB for later retrieval
7. On disconnect, user is marked offline

## Validation Rules
Register:
- name: string, min 2, max 50 characters
- email: valid email format
- password: minimum 6 characters

Login:
- email: valid email format
- password: required

## Security Features
- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT tokens expire after 1 day
- Helmet sets secure HTTP headers
- CORS configured for cross-origin requests
- Rate limiting: 100 requests per 15 minutes per IP
- Morgan logs all incoming HTTP requests
- Socket connections authenticated before allowing access

## Testing Socket.io
Postman's WebSocket support may not handle Socket.io's handshake
protocol directly. Recommended approach:
1. Create a simple HTML file with Socket.io client CDN
2. Open it in two separate browser tabs
3. Connect each tab with a different user's JWT token
4. Send messages between tabs to test real-time delivery

## Notes
- MongoDB must be running before starting the server
- Two users must both be connected via Socket.io for instant
  delivery; otherwise messages are stored and retrieved via
  the REST chat history endpoint
- onlineUsers status is stored in memory (Map) and resets on
  server restart; isOnline in MongoDB reflects last known state