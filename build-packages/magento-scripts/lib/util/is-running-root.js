const os = require('os')

const isRunningRoot = () =>
    ['linux', 'darwin'].includes(os.platform()) && process.getuid() === 0 // UID 0 is always root

module.exports = isRunningRoot
