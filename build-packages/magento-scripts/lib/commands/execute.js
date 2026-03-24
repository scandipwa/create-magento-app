const { executeTask, executeTaskNonInteractive } = require('../tasks/execute')

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'exec <container name> [command...]',
        'Execute command in docker container',
        (yargs) => {
            yargs.option('non-interactive', {
                alias: 'n',
                type: 'boolean',
                default: false,
                description:
                    'Run in non-interactive mode (for AI terminals and scripts)'
            })
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
- varnish (if enabled)

Options:
  --non-interactive, -n  Run in non-interactive mode (no TTY required)`)
        },
        async (argv) => {
            const [containerName, ...commands] = process.argv.slice(3).filter(
                (arg) => arg !== '--non-interactive' && arg !== '-n'
            )

            if (argv.nonInteractive || argv.n) {
                await executeTaskNonInteractive({
                    containerName,
                    commands
                })
                return
            }

            await executeTask({
                containerName,
                commands
            })
        }
    )
}
