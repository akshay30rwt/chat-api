require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const initSocket = require('./src/sockets/chatSocket');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

initSocket(io);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    });
});