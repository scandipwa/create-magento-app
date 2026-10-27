// Regression test: `exec` without a TTY must never wait for an answer.
// It used to stop at the Composer credentials prompt and hang forever.
const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const { packageDir } = require('../magento-scripts')

const TIMEOUT_MS = 90 * 1000
const cli = path.join(packageDir, 'index.js')

// a project with no auth.json, and a HOME with no shell rc file, so
// no Composer credentials can be found anywhere
const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cma-exec-test-'))
const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cma-exec-home-'))
fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify({
        name: 'cma-exec-test',
        private: true,
        version: '0.0.0',
        scandipwa: { type: 'magento' }
    })
)

const env = { ...process.env, HOME: homeDir, SHELL: '/bin/bash' }
delete env.COMPOSER_AUTH

// stdin stays an open pipe that never answers, like an agent's terminal
const child = spawn(process.execPath, [cli, 'exec', 'php', 'true'], {
    cwd: projectDir,
    env,
    stdio: ['pipe', 'pipe', 'pipe']
})

let output = ''
child.stdout.on('data', (data) => {
    output += data
})
child.stderr.on('data', (data) => {
    output += data
})

const timer = setTimeout(() => {
    child.kill('SIGKILL')
}, TIMEOUT_MS)

child.on('close', (code, signal) => {
    clearTimeout(timer)
    fs.rmSync(projectDir, { recursive: true, force: true })
    fs.rmSync(homeDir, { recursive: true, force: true })

    try {
        assert.notStrictEqual(
            signal,
            'SIGKILL',
            `exec without a TTY was still running after ${
                TIMEOUT_MS / 1000
            }s, most likely waiting on a prompt. Output:\n${output}`
        )
        assert.doesNotMatch(output, /Where do you want to store them\?/)
    } catch (e) {
        console.error(e)
        process.exit(1)
    }

    // the project has no Magento installed, so `exec` fails, but it must
    // fail with a message instead of hanging
    console.log(`execute.test.js: ok (exited with code ${code})`)
})
