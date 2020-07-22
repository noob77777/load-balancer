const express = require('express');
const constants = require('./modules/constants');
const { app, server, io } = require('./modules/Common');
const { handleRequest } = require('./modules/LoadBalancer/socketManager');
const LoadBalancer = require('./modules/LoadBalancer/LoadBalancer');
const port = constants.PORT;

app.use(express.urlencoded({ extended: true }));

const loadBalancer = new LoadBalancer();

app.post('/updateservers', (req, res) => {
    console.log(req);
} )

io.on('connection', (client) => {
    client.on('request', (data) => {
        const key = data.key;
        if (!key) {
            console.log(`Invalid key from ${client.id} in request`);
            return;
        }
        const url = loadBalancer.getConsistentServer(data.key);
        handleRequest(
            { request: data, client_id: client.id },
            loadBalancer.getSocket(url)
        );
    });
});

server.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
);
