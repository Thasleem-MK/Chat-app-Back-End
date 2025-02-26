const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')

require('dotenv').config();

const { addUsers, getUser, getUsersInRoom, removeUsers } = require('./users')

const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ORIGIN;

if (!process.env.PORT || !process.env.ORIGIN) {
    console.warn("Environment variables PORT or ORIGIN are missing. Default values are being used.");
}

const router = require('./router');

const app = express()

app.use(cors(
    {
        origin: ORIGIN,
        credentials: true
    }
))

const server = http.createServer(app)
const io = socketio(server, {
    cors: {
        origin: ORIGIN,
        credentials: true,
    }
})

io.on('connection', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { user, error } = addUsers({ id: socket.id, name, room });

        if (error) {
            console.error("User not found for socket:", socket.id);
            return callback(error);
        }

        socket.emit('message', { user: 'admin', text: `${user.name}, Welcome to the room ${user.room}` })
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!` })

        socket.join(user.room)

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user?.room).emit('message', { user: user?.name, text: message })
        io.to(user?.room).emit('roomData', { room: user?.room, users: getUsersInRoom(user?.room) })

        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUsers(socket.id);

        if (user) {
            io.to(user?.room).emit('message', { user: 'admin', text: `${user?.name} has left.` })
        }
    })
})

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`))