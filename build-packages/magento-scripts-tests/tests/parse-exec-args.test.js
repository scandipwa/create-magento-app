const assert = require('assert')
const path = require('path')
const { libDir } = require('../magento-scripts')
const { parseExecArgs } = require(path.join(libDir, 'util/parse-exec-args'))

assert.deepStrictEqual(parseExecArgs(['php', 'bin/magento', 'cache:flush']), {
    nonInteractive: false,
    dryRun: false,
    containerName: 'php',
    commands: ['bin/magento', 'cache:flush']
})

// flags before the container name or right after it belong to magento-scripts
assert.deepStrictEqual(parseExecArgs(['-n', 'php', 'php', '-v']), {
    nonInteractive: true,
    dryRun: false,
    containerName: 'php',
    commands: ['php', '-v']
})
assert.deepStrictEqual(
    parseExecArgs(['php', '--dry-run', '--non-interactive', 'ls']),
    {
        nonInteractive: true,
        dryRun: true,
        containerName: 'php',
        commands: ['ls']
    }
)

// flags after the command binary belong to the command
assert.deepStrictEqual(parseExecArgs(['php', 'grep', '-n', 'foo']), {
    nonInteractive: false,
    dryRun: false,
    containerName: 'php',
    commands: ['grep', '-n', 'foo']
})
assert.deepStrictEqual(parseExecArgs(['mariadb', 'mysql', '--dry-run']), {
    nonInteractive: false,
    dryRun: false,
    containerName: 'mariadb',
    commands: ['mysql', '--dry-run']
})

console.log('parse-exec-args.test.js: ok')
