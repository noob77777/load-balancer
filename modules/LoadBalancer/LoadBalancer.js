const constants = require('../constants');

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
        this.hashServers();
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
        this.servers = [...servers];
        this.hashServers();
    }
    hashServers() {
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
}

module.exports = LoadBalancer;
