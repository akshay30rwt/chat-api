const Message = require('../models/Message');

const getChatHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.userId, receiver: userId },
                { sender: userId, receiver: req.userId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        next(err);
    }
};

module.exports = { getChatHistory };