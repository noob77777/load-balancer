const fs = require('fs');

const LOG = (error) => {
    const dir = './logs';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const dateObj = new Date();
    const month = dateObj.getUTCMonth() + 1;
    const day = dateObj.getUTCDate();
    const year = dateObj.getUTCFullYear();

    const fileName = year + '-' + month + '-' + day + '.log';

    const content =
        dateObj.toString().replace(/T/, ':').replace(/\.\w*/, '') +
        '\t' +
        error.toString() +
        '\n\n';

    fs.appendFile(dir + '/' + fileName, content, (err) => {});
};

module.exports = { LOG: LOG };
