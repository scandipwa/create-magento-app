/**
 * Prompts need both ends of a terminal: stdin to read the answer and stdout
 * to render the question (without a TTY the Listr renderer is silent, so a
 * prompt would wait for an answer to a question nobody can see).
 *
 * @returns {boolean}
 */
const canPrompt = () => !!process.stdin.isTTY && !!process.stdout.isTTY

/**
 * Single source of truth for commands that support non-interactive mode
 * (`exec`, `import-db`, `status`): explicitly requested via a flag, or implied
 * because there is no terminal to prompt in (CI, pipes, AI agents).
 *
 * @param {unknown} [flag] value of the command's non-interactive flag
 * @returns {boolean}
 */
const isNonInteractive = (flag = false) => !!flag || !canPrompt()

module.exports = {
    canPrompt,
    isNonInteractive
}
