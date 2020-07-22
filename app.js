const express = require('express');
const constants = require('./modules/constants');
const { app, server, io } = require('./modules/Common');
const port = constants.PORT;

app.use(express.urlencoded({ extended: true }));

io.on('connection', (client) => {
    
});

server.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
);
