const express = require('express');
const constants = require('./modules/constants');
const { app, server, io } = require('./modules/Common');
const { handleRequest } = require('./modules/LoadBalancer/socketManager');
const Logger = require('./modules/Logger');
const LoadBalancer = require('./modules/LoadBalancer/LoadBalancer');
const port = constants.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const loadBalancer = new LoadBalancer();

app.post('/updateservers/', (req, res) => {
    loadBalancer.updateServers(
        req.body.servers ? req.body.servers : ['http://0:0:0:0']
    );
    res.statusCode = 200;
    res.end();
});

io.on('connection', (client) => {
    client.on('request', (data) => {
        const key = data.key;
        if (!key) {
            Logger.LOG(`Invalid key from ${client.id} in request`);
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
