const fs = require('fs')
const path = require('path')
const pathExists = require('./path-exists')

const CONFIG_PHP_IGNORE = /^\s*\/?app\/etc\/config\.php\s*$/
const CONFIG_PHP_FORCE = /^\s*!\/?app\/etc\/config\.php\s*$/
const CONFIG_PHP_FORCE_LINE = '!/app/etc/config.php'

/**
 * Magento still ships .gitignore with /app/etc/config.php (2.1-era).
 * Adobe docs since 2.2: config.php is shared and must be in source control.
 * env.php stays ignored.
 *
 * @param {string} gitignoreText
 * @returns {string}
 */
const ensureGitignoreTracksConfigPhp = (gitignoreText) => {
    const lines = String(gitignoreText).split(/\r?\n/)
    const kept = lines.filter((line) => !CONFIG_PHP_IGNORE.test(line))
    const hasForce = kept.some((line) => CONFIG_PHP_FORCE.test(line))

    while (kept.length && kept[kept.length - 1] === '') {
        kept.pop()
    }

    if (!hasForce) {
        kept.push(CONFIG_PHP_FORCE_LINE)
    }

    return `${kept.join('\n')}\n`
}

/**
 * @param {(command: string, cwd: string) => Promise<{ code: number, result?: string }>} runCommand
 */
const gitAdd = async (runCommand, command, magentoDir, notes, label) => {
    try {
        const { code, result } = await runCommand(command, magentoDir)
        if (code === 0) {
            notes.push(label)
        } else {
            notes.push(
                `${label} skipped (${(result || '').trim() || `exit ${code}`})`
            )
        }
    } catch (e) {
        notes.push(`${label} skipped (${e.message})`)
    }
}

/**
 * Un-ignore app/etc/config.php, then git-add it (never env.php, never commit).
 *
 * @param {string} magentoDir
 * @param {{ runCommand?: (command: string, cwd: string) => Promise<{ code: number, result?: string }> }} [options]
 * @returns {Promise<string[]>}
 */
const applyEnsureConfigPhpTracked = async (magentoDir, options = {}) => {
    const { runCommand } = options
    const gitignorePath = path.join(magentoDir, '.gitignore')
    const configPhpPath = path.join(magentoDir, 'app', 'etc', 'config.php')
    const gitPath = path.join(magentoDir, '.git')
    const notes = []

    let gitignoreChanged = false
    if (await pathExists(gitignorePath)) {
        const original = await fs.promises.readFile(gitignorePath, 'utf8')
        const next = ensureGitignoreTracksConfigPhp(original)
        if (next !== original) {
            await fs.promises.writeFile(gitignorePath, next)
            gitignoreChanged = true
            notes.push('.gitignore now force-tracks app/etc/config.php')
        }
    }

    const hasConfigPhp = await pathExists(configPhpPath)
    if (!hasConfigPhp) {
        notes.push('app/etc/config.php is not created yet')
    }

    if (!(await pathExists(gitPath))) {
        notes.push('no .git directory; skipped git add')
        return notes
    }

    if (!runCommand) {
        notes.push('no git runner; skipped git add')
        return notes
    }

    if (gitignoreChanged) {
        await gitAdd(
            runCommand,
            'git add -- .gitignore',
            magentoDir,
            notes,
            'git add .gitignore'
        )
    }

    if (hasConfigPhp) {
        await gitAdd(
            runCommand,
            'git add -f -- app/etc/config.php',
            magentoDir,
            notes,
            'git add -f app/etc/config.php'
        )
    }

    return notes
}

module.exports = {
    CONFIG_PHP_FORCE_LINE,
    applyEnsureConfigPhpTracked,
    ensureGitignoreTracksConfigPhp
}
