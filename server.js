const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
const {createNewRoom, deleteRoom, getRooms} = require('./utils/rooms');


const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname, 'public'))); //папка с формами

io.on('connection', socket => {
    // При заходе в лобби
    socket.on('joinLobby', () => {
        socket.emit('roomList', getRooms());
    });
    // При создании новой комнаты
    socket.on('createNewRoom', (roomName) =>{
        createNewRoom(roomName);
        io.emit('roomList', getRooms());
    });
    
    
    socket.on('joinRoom', ({username, room}) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    

    //Пользователь присоединился
   

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        if ( getRoomUsers(user.room).length === 2){
            deleteRoom(user.room);
            socket.broadcast.to(user.room).emit('turn');
            io.emit('roomList', getRooms());
        }
    });


    //Пользователь вышел
    socket.on('disconnect', () =>{
        const user = userLeave(socket.id);

        if(user) {
            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    } );

    socket.on('shot', (num) => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('shot', num);
    });

    socket.on('checkeddrowned', (num) => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('checkeddrowned', num);
    });

    socket.on('mark', ({x, y, size, dir}) => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('mark', ({x, y, size, dir}));
    });

    socket.on('shipsunk', ({num, size, dir}) => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('shipsunk', ({num, size, dir}));
    });

    socket.on('shotResult', ({res, num, ship}) => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('shotResult', ({res, num, ship}));
    });

    socket.on('win', () => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('win');
    });

    socket.on('start', () => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('start');
    });
    socket.on('ready', () => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('ready');
        io.to(user.room).emit('start');
    });
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});