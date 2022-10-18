const path = require('path')
const pathExists = require('../../util/path-exists')
const { execAsyncSpawn } = require('../../util/exec-async-command')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const matchFilesystem = require('../../util/match-filesystem')
const UnknownError = require('../../errors/unknown-error')

/**
 * @type {(theme: import('../../../typings/theme').Theme) => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const buildTheme = ({ themePath }) => ({
    title: `Building theme in ${themePath}`,
    task: async (ctx, task) => {
        const { verbose = false } = ctx

        if (!(await pathExists(path.join(themePath, 'node_modules')))) {
            task.output = 'Installing theme dependencies'
            const commandToInstallDependencies = (await pathExists(
                path.join(themePath, 'package-lock.json')
            ))
                ? 'npm ci'
                : 'npm i'

            try {
                await execAsyncSpawn(commandToInstallDependencies, {
                    cwd: path.join(process.cwd(), themePath),
                    callback: !verbose
                        ? undefined
                        : (t) => {
                              task.output = t
                          }
                })
            } catch (e) {
                throw new UnknownError(`We were unable to install theme dependencies in ${themePath} using ${logger.style.code(
                    commandToInstallDependencies
                )} command!
If you have ${logger.style.file(
                    'package-lock.json'
                )} in theme directory make sure it's up to date with ${logger.style.file(
                    'package.json'
                )} file content.`)
            }
        }

        const magentoThemeDirPath = path.join(
            themePath,
            'magento',
            'Magento_Theme'
        )
        const isMagentoThemeDirMatching = await matchFilesystem(
            magentoThemeDirPath,
            {
                templates: true,
                web: ['static']
            }
        )

        if (isMagentoThemeDirMatching) {
            task.skip()
            return
        }

        task.output = 'Building theme...'
        await execAsyncSpawn('BUILD_MODE=magento npm run build', {
            cwd: path.join(process.cwd(), themePath),
            callback: !verbose
                ? undefined
                : (t) => {
                      task.output = t
                  }
        })
    },
    options: {
        bottomBar: 10
    }
})

module.exports = buildTheme
