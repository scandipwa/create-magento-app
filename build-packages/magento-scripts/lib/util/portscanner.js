/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * This is modified version of node-portscanner (https://github.com/baalexander/node-portscanner/blob/master/lib/portscanner.js)
 * with added option to ignore ports and reduced dependencies count
 */
const net = require('net')

const { Socket } = net

/**
 * Checks the status of an individual port.
 * @param {Number} port - Port to check status on.
 * @param {Object} [options] - Options object.
 * @param {String} [options.host] - Host of where to scan.
 * @param {Number} [options.timeout] - Connection timeout in ms.
 * @returns {Promise<'open' | 'closed'>}
 */
const checkPortStatus = (port, options = {}) =>
    new Promise((resolve, reject) => {
        const { host = '127.0.0.1', timeout = 400 } = options

        let connectionRefused = false

        const socket = new Socket()
        /**
         * @type {'open' | 'closed'}
         */
        let status

        /**
         * @type {Error | null}
         */
        let error

        // Socket connection established, port is open
        socket.on('connect', () => {
            status = 'open'
            socket.destroy()
        })

        // If no response, assume port is not listening
        socket.setTimeout(timeout)
        socket.on('timeout', () => {
            status = 'closed'
            error = new Error(
                `Timeout (${timeout}ms) occurred waiting for ${host}:${port} to be available`
            )
            socket.destroy()
        })

        // Assuming the port is not open if an error. May need to refine based on
        // exception
        socket.on('error', (exception) => {
            // @ts-ignore
            if (exception.code !== 'ECONNREFUSED') {
                error = exception
            } else {
                connectionRefused = true
            }
            status = 'closed'
        })

        // Return after the socket has closed
        socket.on('close', (hadError) => {
            if (hadError && !connectionRefused) {
                error = new Error('Socket closed with an error!')
            } else {
                error = null
            }
            if (error) {
                return reject(error)
            }

            return resolve(status)
        })

        socket.connect(port, host)
    })

/**
 * Internal helper function used by {@link findAPortInUse} and {@link findAPortNotInUse}
 * to find a port from a range or a list with a specific status.
 * @param {'open' | 'closed'} status - Status to check.
 * @param {Object} options
 * @param {Number} options.startPort Port to begin status check on (inclusive).
 * @param {Number} options.endPort Last port to check status on (inclusive).
 * @param {String} [options.host] Host of where to scan.
 * @param {Number[]} [options.portList] Array of ports to check status on.
 * @param {Number[]} [options.portIgnoreList] Array of ports to check status on.
 * @returns {Promise<number | false>}
 */
async function findAPortWithStatus(status, options) {
    const {
        portList,
        startPort,
        endPort = 65535,
        host,
        portIgnoreList = []
    } = options

    let foundPort = false
    let numberOfPortsChecked = 0
    let port = portList ? portList[0] : startPort

    // Returns true if a port with matching status has been found or if checked
    // the entire range of ports
    const hasFoundPort = () =>
        foundPort ||
        numberOfPortsChecked ===
            (portList ? portList.length : endPort - startPort + 1)

    // Checks the status of the port
    const checkNextPort = async () => {
        if (portIgnoreList.includes(port)) {
            numberOfPortsChecked++
            port = portList ? portList[numberOfPortsChecked] : port + 1
            return
        }
        const statusOfPort = await checkPortStatus(port, { host })
        if (statusOfPort === status) {
            foundPort = true
            return
        }
        numberOfPortsChecked++
        port = portList ? portList[numberOfPortsChecked] : port + 1
    }

    while (!hasFoundPort()) {
        await checkNextPort()
    }

    if (foundPort) {
        return port
    }

    return false
}

/**
 * Finds the first port with a status of 'open', implying the port is in use and
 * there is likely a service listening on it.
 * @param {Object} options
 * @param {Number} options.startPort Port to begin status check on (inclusive).
 * @param {Number} options.endPort Last port to check status on (inclusive).
 * @param {String} options.host Host of where to scan.
 * @param {Number[]} options.portList Array of ports to check status on.
 * @param {Number[]} options.portIgnoreList Array of ports to check status on.
 */
const findAPortInUse = (options) => findAPortWithStatus('open', options)

/**
 * Finds the first port with a status of 'closed', implying the port is not in
 * @param {Object} options
 * @param {Number} options.startPort Port to begin status check on (inclusive).
 * @param {Number} options.endPort Last port to check status on (inclusive).
 * @param {String} [options.host] Host of where to scan.
 * @param {Number[]} [options.portList] Array of ports to check status on.
 * @param {Number[]} options.portIgnoreList Array of ports to check status on.
 */
const findAPortNotInUse = (options) => findAPortWithStatus('closed', options)

module.exports = {
    findAPortInUse,
    findAPortNotInUse,
    checkPortStatus
}
