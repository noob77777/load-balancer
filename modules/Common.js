const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

module.exports = { app: app, server: server, io: io };
