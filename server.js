const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));

let conectedUsers = [];

io.on('connection', (socket)=>{
    console.log("Conexão detectada");

    socket.on('join-request', (username)=>{
        socket.username = username;
        conectedUsers.push(username);
        console.log(conectedUsers);
        
        socket.emit('user-ok', conectedUsers);
        socket.broadcast.emit('list-update', {
            joined: username,
            list: conectedUsers
        })
    });

    socket.on('disconnect', () => {
        conectedUsers = conectedUsers.filter(u => u != socket.username);
        console.log(conectedUsers);

        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: conectedUsers
        });
    })

    socket.on('send-msg', (txt)=>{
        let obj = {
            username: socket.username,
            message: txt
        };

        socket.broadcast.emit('show-msg', obj);
    })
});