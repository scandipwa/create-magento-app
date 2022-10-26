const net = require('net')
const UnknownError = require('../errors/unknown-error')
const sleep = require('./sleep')

/**
 * @param {{ host: string, port: number}} param0
 * @returns {Promise<void>}
 */
const connectToHostPort = ({ host, port }) =>
    new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port, timeout: 15 * 1000 })

        socket.on('connect', () => {
            socket.end()
            resolve()
        })
        socket.on('error', (err) => {
            socket.end()
            reject(err)
        })
        socket.on('timeout', () => {
            socket.end()
            reject(new UnknownError('Connection timeout'))
        })
    })

/**
 * @param {{ name: string, host: string, port: number, output: (arg: string) => void }} param0
 */
const waitForIt = async ({ name, host, port, output }) => {
    const startTime = Date.now()
    let connected = false
    output(`Waiting for ${name} at ${host}:${port}...`)
    while (!connected) {
        try {
            await Promise.race([
                sleep(300).then(() => {
                    throw new UnknownError('Connection timeout')
                }),
                connectToHostPort({ host, port })
            ])
            connected = true
        } catch {}
    }

    const endTime = Date.now()
    output(
        `${name} at ${host}:${port} is available after ${(
            (endTime - startTime) /
            1000
        ).toFixed(0)} seconds`
    )
}

module.exports = waitForIt
