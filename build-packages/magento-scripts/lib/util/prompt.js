const KnownError = require('../errors/known-error')
const { canPrompt } = require('./is-non-interactive')

/**
 * @typedef {import('listr2').ListrTaskWrapper<any, any>} TaskWrapper
 * @typedef {Parameters<TaskWrapper['prompt']>[0]} PromptOptions
 */

/**
 * @param {PromptOptions} options
 * @returns {string}
 */
const getQuestion = (options) => {
    const [first] = Array.isArray(options) ? options : [options]
    const message = first && 'message' in first ? first.message : undefined

    return typeof message === 'string' ? message.trim() : ''
}

/**
 * The only way magento-scripts asks the user anything. Never waits for an
 * answer that cannot come:
 *
 * - `ctx.nonInteractive` and `answer` provided → returns `answer`;
 * - `ctx.nonInteractive` without `answer`, or no TTY at all → throws a
 *   KnownError that quotes the question (and `hint`, if any);
 * - otherwise → shows the prompt.
 *
 * Without a TTY in a command that did not opt into non-interactive mode
 * (e.g. `start`) we fail even if `answer` exists: those defaults were picked
 * for an explicit non-interactive run, not as a silent fallback.
 *
 * @param {TaskWrapper} task
 * @param {{ nonInteractive?: boolean }} ctx
 * @param {PromptOptions} options
 * @param {{ answer?: unknown, hint?: string }} [nonInteractive]
 * @returns {Promise<any>}
 */
const prompt = async (task, ctx, options, nonInteractive = {}) => {
    if (ctx.nonInteractive && 'answer' in nonInteractive) {
        return nonInteractive.answer
    }

    if (ctx.nonInteractive || !canPrompt()) {
        const question = getQuestion(options)

        throw new KnownError(
            [
                `magento-scripts needs an answer to continue, but it is running non-interactively (${
                    ctx.nonInteractive
                        ? 'non-interactive mode'
                        : 'no TTY attached'
                }).`,
                question && `Question:\n${question}`,
                nonInteractive.hint
            ]
                .filter(Boolean)
                .join('\n\n')
        )
    }

    // the one sanctioned call site, see magento-scripts-tests/tests/prompt.test.js
    return task.prompt(options)
}

module.exports = { prompt }
