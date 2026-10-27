/** @type {Record<string, 'nonInteractive' | 'dryRun'>} */
const EXEC_FLAGS = {
    '--non-interactive': 'nonInteractive',
    '-n': 'nonInteractive',
    '--dry-run': 'dryRun'
}

/**
 * Splits `exec` arguments into magento-scripts flags, the container name and
 * the command. Flags are only recognised before the command binary
 * (`exec -n php ...` or `exec php -n ...`), so the command keeps its own
 * flags: `exec php grep -n foo` still runs `grep -n foo`.
 *
 * @param {string[]} args arguments after `exec`
 */
const parseExecArgs = (args) => {
    /** @type {{ nonInteractive: boolean, dryRun: boolean }} */
    const flags = { nonInteractive: false, dryRun: false }
    /** @type {string[]} */
    const positional = []

    for (const arg of args) {
        if (positional.length < 2 && arg in EXEC_FLAGS) {
            flags[EXEC_FLAGS[arg]] = true
        } else {
            positional.push(arg)
        }
    }

    const [containerName, ...commands] = positional

    return { ...flags, containerName, commands }
}

module.exports = { parseExecArgs }
