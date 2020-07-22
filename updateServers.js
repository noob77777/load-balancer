const fs = require('fs');
const axios = require('axios');
const constants = require('./modules/constants');

const data = fs.readFileSync('./servers.txt', { encoding: 'utf8', flag: 'r' });
const servers = data.split('\n').filter((str) => str !== '');
const request = { servers: servers };

try {
    axios.post(`http://localhost:${constants.PORT}/updateservers`, request);
    console.log(servers);
} catch (e) {
    console.log(e);
}
