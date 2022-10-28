const { executeTask } = require('../tasks/execute')

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'exec <container name> [commands...]',
        'Execute command in docker container',
        (yargs) => {
            yargs.usage(`Usage: npm run exec <container name> [commands...]

Available containers:
- mariadb
- nginx
- redis
- elasticsearch
- varnish (if enabled)
- sslTerminator`)
        },
        async (argv) => {
            await executeTask(argv)
        }
    )
}
