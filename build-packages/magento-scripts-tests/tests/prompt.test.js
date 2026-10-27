const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { libDir } = require('../magento-scripts')
const KnownError = require(path.join(libDir, 'errors/known-error'))
const { prompt } = require(path.join(libDir, 'util/prompt'))

const setTTY = (/** @type {boolean} */ isTTY) => {
    process.stdin.isTTY = isTTY
    process.stdout.isTTY = isTTY
}

const fakeTask = () => {
    const calls = /** @type {unknown[]} */ ([])
    const task = /** @type {any} */ ({
        prompt: async (/** @type {unknown} */ options) => {
            calls.push(options)
            return 'from-user'
        }
    })

    return { task, calls }
}

const question = { type: 'Confirm', message: 'Delete everything?' }

;(async () => {
    // non-interactive with an answer: answer returned, prompt never shown
    {
        setTTY(true)
        const { task, calls } = fakeTask()
        const result = await prompt(
            task,
            { nonInteractive: true },
            /** @type {any} */ (question),
            { answer: false }
        )
        assert.strictEqual(result, false)
        assert.strictEqual(calls.length, 0)
    }

    // an explicit `undefined` answer still counts as an answer
    {
        const { task } = fakeTask()
        const result = await prompt(
            task,
            { nonInteractive: true },
            /** @type {any} */ (question),
            { answer: undefined }
        )
        assert.strictEqual(result, undefined)
    }

    // non-interactive without an answer: fails with the question and hint
    {
        const { task, calls } = fakeTask()
        await assert.rejects(
            prompt(
                task,
                { nonInteractive: true },
                /** @type {any} */ (question),
                {
                    hint: 'Pass --yes.'
                }
            ),
            (/** @type {Error} */ e) =>
                e instanceof KnownError &&
                e.message.includes('Delete everything?') &&
                e.message.includes('Pass --yes.')
        )
        assert.strictEqual(calls.length, 0)
    }

    // no TTY and not opted into non-interactive mode: fails even with an answer
    {
        setTTY(false)
        const { task, calls } = fakeTask()
        await assert.rejects(
            prompt(task, {}, /** @type {any} */ (question), { answer: true }),
            (/** @type {Error} */ e) =>
                e instanceof KnownError && e.message.includes('no TTY attached')
        )
        assert.strictEqual(calls.length, 0)
    }

    // interactive: shows the prompt
    {
        setTTY(true)
        const { task, calls } = fakeTask()
        const result = await prompt(task, {}, /** @type {any} */ (question), {
            answer: true
        })
        assert.strictEqual(result, 'from-user')
        assert.deepStrictEqual(calls, [question])
    }

    // every prompt goes through the helper, so none can hang without a TTY
    const helper = path.join(libDir, 'util', 'prompt.js')
    /** @type {string[]} */
    const offenders = []
    const walk = (/** @type {string} */ dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const file = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                walk(file)
            } else if (
                file.endsWith('.js') &&
                file !== helper &&
                /\.prompt\(/.test(fs.readFileSync(file, 'utf-8'))
            ) {
                offenders.push(path.relative(libDir, file))
            }
        }
    }
    walk(libDir)
    assert.deepStrictEqual(
        offenders,
        [],
        `Use prompt() from lib/util/prompt.js instead of task.prompt() in: ${offenders.join(
            ', '
        )}`
    )

    console.log('prompt.test.js: ok')
})().catch((e) => {
    console.error(e)
    process.exit(1)
})
