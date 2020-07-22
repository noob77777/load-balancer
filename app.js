const express = require('express');
const request = require('request');
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

const handler = (req, res) => {
    const _req = request({ url: loadBalancer.getRandomServer() + req.url }).on(
        'error',
        (error) => {
            res.status(500).send(
                error.message ? error.message : '500: Internal Server Error'
            );
        }
    );
    req.pipe(_req).pipe(res);
};

app.get('*', handler);
app.post('*', handler);

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
