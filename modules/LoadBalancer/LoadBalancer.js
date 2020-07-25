const constants = require('../constants');
const ioClient = require('socket.io-client');
const { handleResponse } = require('./socketManager');
const Logger = require('../Logger');

class LoadBalancer {
    constructor(servers = ['0:0:0:0']) {
        this.hashCount = constants.HASH_COUNT;
        this.mod = constants.MOD;

        this.mask = [];
        for (let i = 0; i < this.mod; i++) {
            this.mask.push(-1);
        }
        this.seeds = [];
        for (let i = 0; i < this.hashCount; i++) {
            this.seeds.push(Math.random().toString());
        }

        this.servers = [...servers];
        this.serverSockets = {};

        this.hashServers();
        this.buildSockets();
    }
    static hash(key, seed = '0') {
        const str = key + ':' + seed;
        let hash = 0,
            i,
            chr;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
        }
        return hash;
    }
    updateServers(servers) {
        Logger.LOG(`Updating servers list for load balancer.
servers: ${servers}`);

        this.servers = [...servers];
        this.hashServers();
        this.buildSockets();

        Logger.LOG(`Distribution:\n ${this.mask}`);
    }
    buildSockets() {
        let temp = {};
        this.servers.forEach((server) => {
            temp[server] = ioClient(server);
            temp[server].on('response', handleResponse);
        });
        this.serverSockets = { ...temp };
    }
    hashServers() {
        for (let i = 0; i < this.mod; i++) {
            this.mask[i] = -1;
        }

        let last = -1;
        for (let i = 0; i < this.servers.length; i++) {
            for (let j = 0; j < this.seeds.length; j++) {
                const idx =
                    ((LoadBalancer.hash(this.servers[i], this.seeds[j]) %
                        this.mod) +
                        this.mod) %
                    this.mod;
                this.mask[idx] = i;
                last = idx;
            }
        }

        if (last === -1) return;
        for (let cnt = this.mod - 1; cnt >= 0; cnt--) {
            const idx = (cnt + last) % this.mod;
            if (this.mask[idx] === -1) {
                this.mask[idx] = this.mask[(idx + 1) % this.mod];
            }
        }
    }
    getRandomServer() {
        const idx = Math.floor(Math.random() * this.servers.length);
        return this.servers[idx];
    }
    getConsistentServer(key) {
        const idx = ((LoadBalancer.hash(key) % this.mod) + this.mod) % this.mod;
        return this.servers[this.mask[idx]];
    }
    getSocket(server) {
        return this.serverSockets[server];
    }
}

module.exports = LoadBalancer;
