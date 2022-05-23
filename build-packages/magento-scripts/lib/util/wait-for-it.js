const net = require('net');
const UnknownError = require('../errors/unknown-error');
const sleep = require('./sleep');

const connectToHostPort = ({ host, port }) => new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port, timeout: 15 * 1000 });

    socket.on('connect', () => {
        socket.end();
        resolve();
    });
    socket.on('error', (err) => {
        socket.end();
        reject(err);
    });
    socket.on('timeout', () => {
        socket.end();
        reject(new UnknownError('Connection timeout'));
    });
});

const waitForIt = async ({
    name, host, port, output
}) => {
    const startTime = Date.now();
    let connected = false;
    output(`Waiting for ${name} at ${host}:${port}...`);
    while (!connected) {
        try {
            // eslint-disable-next-line no-await-in-loop
            await Promise.race([
                sleep(300).then(() => {
                    throw new UnknownError('Connection timeout');
                }),
                connectToHostPort({ host, port })
            ]);
            connected = true;
        // eslint-disable-next-line no-empty
        } catch {}
    }

    const endTime = Date.now();
    output(`${name} at ${host}:${port} is available after ${((endTime - startTime) / 1000).toFixed(0)} seconds`, 3);
};

module.exports = waitForIt;
