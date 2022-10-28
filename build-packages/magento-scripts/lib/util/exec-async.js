const { exec } = require('child_process')

/**
 * @param {string} command
 * @param {{ encoding: 'buffer' | null; } & import('child_process').ExecOptions} options
 */
const execAsync = (command, options) =>
    new Promise((resolve, reject) => {
        exec(command, options, (err, stdout) =>
            err ? reject(err) : resolve(stdout)
        )
    })

module.exports = {
    execAsync
}
