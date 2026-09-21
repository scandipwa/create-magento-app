const assert = require('assert')
const {
    CONFIG_PHP_FORCE_LINE,
    ensureGitignoreTracksConfigPhp
} = require('./ensure-config-php-tracked')

const magento248 = `/.idea
/app/etc/config.php
/app/etc/env.php
/vendor/*
`

const tracked = ensureGitignoreTracksConfigPhp(magento248)

assert.ok(!tracked.split('\n').includes('/app/etc/config.php'))
assert.ok(tracked.split('\n').includes('/app/etc/env.php'))
assert.ok(tracked.includes(CONFIG_PHP_FORCE_LINE))
assert.ok(tracked.endsWith('\n'))

const alreadyForced = ensureGitignoreTracksConfigPhp(
    `/app/etc/env.php\n${CONFIG_PHP_FORCE_LINE}\n`
)
assert.strictEqual(
    alreadyForced.split('\n').filter((l) => l === CONFIG_PHP_FORCE_LINE).length,
    1
)

const unprefixedIgnore = ensureGitignoreTracksConfigPhp(
    'app/etc/config.php\n/app/etc/env.php\n'
)
assert.ok(!unprefixedIgnore.split('\n').includes('app/etc/config.php'))
assert.ok(unprefixedIgnore.includes(CONFIG_PHP_FORCE_LINE))

const empty = ensureGitignoreTracksConfigPhp('')
assert.strictEqual(empty, `${CONFIG_PHP_FORCE_LINE}\n`)

const crlf = ensureGitignoreTracksConfigPhp(
    '/app/etc/config.php\r\n/app/etc/env.php\r\n'
)
assert.ok(!crlf.split('\n').includes('/app/etc/config.php'))
assert.ok(crlf.split('\n').includes('/app/etc/env.php'))
assert.ok(crlf.includes(CONFIG_PHP_FORCE_LINE))

const ignoreAfterForce = ensureGitignoreTracksConfigPhp(
    `${CONFIG_PHP_FORCE_LINE}\n/app/etc/config.php\n`
)
assert.ok(!ignoreAfterForce.split('\n').includes('/app/etc/config.php'))
assert.strictEqual(
    ignoreAfterForce.trim().split('\n').pop(),
    CONFIG_PHP_FORCE_LINE
)

console.log('ensure-config-php-tracked.test.js: gitignore transform ok')

const os = require('os')
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { applyEnsureConfigPhpTracked } = require('./ensure-config-php-tracked')

const isIgnored = (cwd, relPath) => {
    try {
        execFileSync('git', ['check-ignore', '-q', '--', relPath], { cwd })
        return true
    } catch (e) {
        return false
    }
}

const stagedFiles = (cwd) =>
    execFileSync('git', ['diff', '--cached', '--name-only'], {
        cwd,
        encoding: 'utf8'
    })
        .split('\n')
        .filter(Boolean)

;(async () => {
    const { execSync } = require('child_process')
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cma-config-php-'))
    execFileSync('git', ['init'], { cwd: dir, stdio: 'pipe' })
    fs.writeFileSync(
        path.join(dir, '.gitignore'),
        '/app/etc/config.php\n/app/etc/env.php\n'
    )
    fs.mkdirSync(path.join(dir, 'app', 'etc'), { recursive: true })
    fs.writeFileSync(
        path.join(dir, 'app', 'etc', 'config.php'),
        "<?php\nreturn ['modules' => []];\n"
    )
    fs.writeFileSync(
        path.join(dir, 'app', 'etc', 'env.php'),
        '<?php\nreturn [];\n'
    )

    assert.ok(isIgnored(dir, 'app/etc/config.php'))
    assert.ok(isIgnored(dir, 'app/etc/env.php'))

    const notes = await applyEnsureConfigPhpTracked(dir, {
        runCommand: async (command, cwd) => {
            try {
                const result = execSync(command, {
                    cwd,
                    encoding: 'utf8'
                })
                return { code: 0, result }
            } catch (e) {
                return {
                    code: e.status || 1,
                    result: e.stderr ? String(e.stderr) : e.message
                }
            }
        }
    })
    assert.ok(notes.some((n) => n.includes('force-tracks')))
    assert.ok(notes.some((n) => n.includes('git add -f app/etc/config.php')))

    assert.strictEqual(
        isIgnored(dir, 'app/etc/config.php'),
        false,
        'config.php must not be gitignored'
    )
    assert.ok(isIgnored(dir, 'app/etc/env.php'), 'env.php must stay gitignored')

    const staged = stagedFiles(dir)
    assert.ok(staged.includes('app/etc/config.php'))
    assert.ok(staged.includes('.gitignore'))
    assert.ok(!staged.includes('app/etc/env.php'))

    const status = execFileSync('git', ['status', '--short'], {
        cwd: dir,
        encoding: 'utf8'
    })
    assert.ok(!status.includes('A  app/etc/env.php'))
    assert.ok(!status.includes('?? app/etc/config.php'))

    fs.rmSync(dir, { recursive: true, force: true })

    const noGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cma-config-php-nogit-'))
    fs.writeFileSync(
        path.join(noGitDir, '.gitignore'),
        '/app/etc/config.php\n/app/etc/env.php\n'
    )
    const noGitNotes = await applyEnsureConfigPhpTracked(noGitDir, {
        runCommand: async () => {
            throw new Error('git should not run without .git')
        }
    })
    assert.ok(noGitNotes.some((n) => n.includes('no .git directory')))
    const noGitIgnore = fs.readFileSync(
        path.join(noGitDir, '.gitignore'),
        'utf8'
    )
    assert.ok(!noGitIgnore.split('\n').includes('/app/etc/config.php'))
    assert.ok(noGitIgnore.includes(CONFIG_PHP_FORCE_LINE))
    fs.rmSync(noGitDir, { recursive: true, force: true })

    console.log('ensure-config-php-tracked.test.js: git apply ok')
})().catch((e) => {
    console.error(e)
    process.exit(1)
})

