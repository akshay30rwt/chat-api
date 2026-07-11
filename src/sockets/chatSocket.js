const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const onlineUsers = new Map();

const initSocket = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if(!token) {
            return next(new Error('No token provided'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } 
        catch(error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.user.userId}`);

        onlineUsers.set(socket.user.userId, socket.id);
        await User.findByIdAndUpdate(socket.user.userId, { isOnline: true });

        socket.on('sendMessage', async ({ receiverId, content }) => {
            const message = new Message({
                sender: socket.user.userId,
                receiver: receiverId,
                content
            });
            await message.save();

            const receiverSocketId = onlineUsers.get(receiverId);
            if(receiverSocketId) {
                io.to(receiverSocketId).emit('receiveMessage', {
                    senderId: socket.user.userId,
                    content,
                    createdAt: message.createdAt
                });
            }
        });

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.userId}`);
            onlineUsers.delete(socket.user.userId);
            await User.findByIdAndUpdate(socket.user.userId, { isOnline: false });
        });
    });
};

module.exports = initSocket;