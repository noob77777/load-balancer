const assert = require('assert');
const io = require('socket.io-client');
const socket = io('http://localhost');

socket.on('response', (data) => {
    console.log(data);
    assert(data.status === 'OK');
});

const sourceCode = `
#include<stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int x = 0;
    for(int i = 0; i < n; i++) {
        x++;
    }
    printf("%d %d", x, n);
    return 0;
}
`;
const key = 'testzp3e';
const language = '0';
const stdin = `
10000000
`;
const stdout = `10000000 10000000`;
const request = {
    requestType: 'delete',
    sourceCode: sourceCode,
    stdin: stdin,
    stdout: stdout,
    key: key,
    language: language,
};

for (let i = 0; i < 50; i++) {
    socket.emit('request', { ...request, key: i + 1, requestType: 'run' });
}

for (let i = 0; i < 50; i++) {
    socket.emit('request', {
        ...request,
        key: i + 101,
        requestType: 'run',
        language: '1',
    });
}

socket.emit('request', { ...request, requestType: 'compile' });
socket.emit('request', {
    ...request,
    key: 'testcpp',
    requestType: 'compile',
    language: '1',
});

for (let i = 0; i < 50; i++) {
    socket.emit('request', {
        ...request,
        requestType: 'check',
    });
}

for (let i = 0; i < 50; i++) {
    socket.emit('request', {
        ...request,
        key: 'testcpp',
        requestType: 'check',
        language: '1',
        stdout: '1',
    });
}

socket.emit('request', { ...request });
socket.emit('request', { ...request, key: 'testcpp' });

socket.emit('request', {
    ...request,
    requestType: 'run',
    key: 'error',
    sourceCode: 'bruh;',
});
