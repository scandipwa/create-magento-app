const { executeTask } = require('../tasks/execute')

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'exec <container name> [command...]',
        'Execute command in docker container',
        (yargs) => {
            yargs.usage(`Usage: npm run exec <container name> [command...]

Available containers:
- php
- phpWithXdebug
- sslTerminator
- nginx
- redis
- mariadb
- elasticsearch
- maildev
- varnish (if enabled)`)
        },
        async () => {
            const [containerName, ...commands] = process.argv.slice(3)
            await executeTask({
                containerName,
                commands
            })
        }
    )
}
