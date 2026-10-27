const { executeTask } = require('../tasks/execute')
const { parseExecArgs } = require('../util/parse-exec-args')

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
            yargs.option('dry-run', {
                type: 'boolean',
                default: false,
                description:
                    'Print the target container, user and mode as JSON without running anything'
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
  --non-interactive, -n  Run in non-interactive mode (no TTY required)
  --dry-run              Print the target container, user and mode as JSON

Options are only read before the command, so the command keeps its own flags.`)
        },
        async () => {
            // yargs would also read flags meant for the command itself
            // (`exec php grep -n foo`), so parse the raw arguments
            await executeTask(parseExecArgs(process.argv.slice(3)))
        }
    )
}
