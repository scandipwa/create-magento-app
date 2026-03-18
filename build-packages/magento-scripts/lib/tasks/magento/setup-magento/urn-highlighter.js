const fs = require('fs')
const path = require('path')
const magentoTask = require('../../../util/magento-task')
const pathExists = require('../../../util/path-exists')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 *
 * @reference https://devdocs.magento.com/guides/v2.4/config-guide/cli/config-cli-subcommands-urn.html
 */
const urnHighlighterForPHPStorm = () => ({
    title: 'Generating URN highlighter for PHPStorm',
    task: async (ctx, task) => {
        if (!(await pathExists(path.join(process.cwd(), './.idea')))) {
            await fs.promises.mkdir(path.join(process.cwd(), './.idea'))
        }

        if (await pathExists(path.join(process.cwd(), './.idea/misc.xml'))) {
            task.skip()
            return
        }

        return task.newListr(
            magentoTask('dev:urn-catalog:generate -- ./.idea/misc.xml')
        )
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const vscodeSettingsXmlCatalogs = () => ({
    task: async (ctx, task) => {
        const settingsPath = path.join(process.cwd(), './.vscode/settings.json')
        const catalogEntry = './.vscode/catalog.xml'

        let settings = {}
        if (await pathExists(settingsPath)) {
            try {
                const content = await fs.promises.readFile(settingsPath, 'utf8')
                settings = JSON.parse(content)
            } catch {
                // If the file is not valid JSON, we'll overwrite the xml.catalogs key only
            }
        }

        const existing = settings['xml.catalogs']
        /** @type {string[]} */
        const catalogs = Array.isArray(existing) ? existing : []

        if (catalogs.includes(catalogEntry)) {
            task.skip()
            return
        }

        settings['xml.catalogs'] = [...catalogs, catalogEntry]
        await fs.promises.writeFile(
            settingsPath,
            JSON.stringify(settings, null, 4),
            'utf8'
        )
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 *
 * @reference https://www.thebeardeddeveloper.co.uk/resources/articles/vscode-xml-autocomplete-for-magento
 */
const urnHighlighterForVSCode = () => ({
    title: 'Generating URN highlighter for VSCode',
    task: async (ctx, task) => {
        if (!(await pathExists(path.join(process.cwd(), './.vscode')))) {
            await fs.promises.mkdir(path.join(process.cwd(), './.vscode'))
        }

        const subtasks = []

        if (
            !(await pathExists(
                path.join(process.cwd(), './.vscode/catalog.xml')
            ))
        ) {
            subtasks.push(
                magentoTask(
                    'dev:urn-catalog:generate --ide=vscode ./.vscode/catalog.xml'
                )
            )
        }

        subtasks.push(vscodeSettingsXmlCatalogs())

        return task.newListr(subtasks)
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const urnHighlighter = () => ({
    title: 'Generating URN highlighter',
    task: (ctx, task) =>
        task.newListr(
            [urnHighlighterForPHPStorm(), urnHighlighterForVSCode()],
            {
                concurrent: true
            }
        )
})

module.exports = urnHighlighter
