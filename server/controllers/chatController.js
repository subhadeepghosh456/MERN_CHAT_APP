const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Chat = require("./../models/chat");
const Message = require("./../models/message");

router.post('/create-new-chat', authMiddleware, async (req, res) => {
    try {
        const chat = new Chat(req.body);
        const savedChat = await chat.save();

        await savedChat.populate('members');

        return res.status(201).send({
            message: 'Chat Created Successfully',
            success: true,
            data: savedChat
        })
    } catch (error) {
        res.status(500).send(
            {
                message: error.message,
                success: false
            }
        )
    }
})

router.get('/get-all-chats', authMiddleware, async (req, res) => {
    try {
        const allChat = await Chat.find({ members: { $in: req.body.userId } })
            .populate("lastMessage")
            .populate('members', '-password').sort({ updatedAt: -1 })

        res.status(201).send({
            message: 'Chat fetched successfully',
            success: true,
            data: allChat
        })
    } catch (error) {
        res.status(500).send(
            {
                message: error.message,
                success: false
            }
        )
    }
})

router.post("/clear-unread-messages", authMiddleware, async (req, res) => {
    try {
        const chatId = req.body.chatId;
        const chat = await Chat.findById(chatId);
        if (!chat) {
            res.send(
                {
                    message: error.message,
                    success: false
                }
            )
        }

        const updatedChat = await Chat.findByIdAndUpdate(chatId, { unreadMessageCount: 0 }, { new: true })
            .populate("members")
            .populate("lastMessage");

        await Message.updateMany(
            { chatId: chatId, read: false },
            { read: true }

        )

        res.send({
            message: "Unread message cleared successfully",
            success: true,
            data: updatedChat
        })


    } catch (error) {
        res.status(500).send(
            {
                message: error.message,
                success: false
            }
        )
    }
})

module.exports = router;