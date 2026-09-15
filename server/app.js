const express = require("express");
const app = express();
const authRouter = require("./controllers/authController");
const userRouter = require("./controllers/userController");
const chatRouter = require("./controllers/chatController");
const messageRouter = require("./controllers/messageController");


app.use(express.json())
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
})

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

const onlineUsers = [];

io.on('connection', socket => {
    socket.on('join-room', userid => {
        socket.join(userid);
    })

    socket.once('send-message', (message) => {
        console.log("message", message)
        io
            .to(message.members[0])
            .to(message.members[1])
            .emit('receive-message', message)
    })

    socket.on('clear-unread-message', (data) => {
        io
            .to(data.members[0])
            .to(data.members[1])
            .emit('message-count-cleared', data)
    })

    socket.on('user-typing', (data) => {
        io
        .to(data.members[0])
        .to(data.members[1])
        .emit('started-typing', data)
    })

    socket.on("user-login",userId=>{
         if(!onlineUsers.includes(userId)){
            onlineUsers.push(userId)
         }
        //  console.log("onlineUsers server",onlineUsers)
         socket.emit("online-users",onlineUsers);
    })

})

module.exports = server;