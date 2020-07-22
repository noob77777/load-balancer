const fs = require('fs');
const axios = require('axios');
const constants = require('./modules/constants');

const data = fs.readFileSync('./servers.txt', { encoding: 'utf8', flag: 'r' });

const request = { servers: data.split('\n') };

try {
    axios.post(
        `http://localhost:${constants.PORT}/updateservers`,
        request,
        () => {}
    );
    console.log('OK');
} catch (e) {
    console.log(e);
}
