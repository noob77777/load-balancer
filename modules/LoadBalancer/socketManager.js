const asyncRedis = require('async-redis');
const { io } = require('../Common');
const constants = require('../constants');
const Logger = require('../Logger');

const redisGetClient = () => {
    const client = asyncRedis.createClient({
        host: constants.REDIS_SERVER,
        post: constants.REDIS_PORT,
    });

    client.on('error', (err) => {
        Logger.LOG(`error: ${err}`);
    });

    return client;
};

const handleRequest = async (data, socket) => {
    if (!socket) {
        Logger.LOG(
            `socketManager.handleRequest param socket is null
            for key: ${data.key}`
        );
        return;
    }
    const { request, client_id } = { ...data };
    const redisClient = redisGetClient();
    await redisClient.set(request.key, client_id);
    socket.emit('request', { ...request });
    redisClient.quit();
};

const handleResponse = async (data) => {
    const key = data.key;
    if (!key) {
        Logger.LOG('Fatal error: Invalid key in response.');
        return;
    }
    const redisClient = redisGetClient();
    const client_id = await redisClient.get(key);
    io.to(client_id).emit('response', data);
    redisClient.quit();
};

module.exports = {
    handleRequest: handleRequest,
    handleResponse: handleResponse,
};
