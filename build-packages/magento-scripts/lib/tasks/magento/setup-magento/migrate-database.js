const path = require('path')
const installMagentoProject = require('../install-magento-project')
const magentoTask = require('../../../util/magento-task')
const runMagentoCommand = require('../../../util/run-magento')
const configureSearchEngine = require('./configure-searchengine')
const installMagento = require('./install-magento')
const upgradeMagento = require('./upgrade-magento')
const varnishConfigSetup = require('./varnish-config')
const pathExists = require('../../../util/path-exists')
const updateEnvPHP = require('../../php/update-env-php')
const UnknownError = require('../../../errors/unknown-error')
const checkSearchEngineVersion = require('../../requirements/searchengine-version')

/**
 * @param {Object} [options]
 * @param {Boolean} [options.onlyInstallMagento]
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const migrateDatabase = (options = {}) => ({
    title: 'Migrating database',
    task: async (ctx, task) => {
        const { databaseConnection } = ctx
        const { varnish } = ctx.config.overridenConfiguration.configuration

        const [[{ tableCount }]] = await databaseConnection.query(`
            SELECT count(*) AS tableCount
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'magento';
        `)

        if (
            tableCount === 0 ||
            !(
                (await pathExists(
                    path.join(process.cwd(), 'app', 'etc', 'env.php')
                )) ||
                !(await pathExists(
                    path.join(process.cwd(), 'app', 'etc', 'config.php')
                ))
            )
        ) {
            if (options.onlyInstallMagento) {
                ctx.isSetupUpgradeNeeded = false
                return task.newListr([installMagento({ isDbEmpty: true })])
            }

            return task.newListr(
                [
                    checkSearchEngineVersion(),
                    installMagento({ isDbEmpty: true }),
                    updateEnvPHP(),
                    varnishConfigSetup(),
                    configureSearchEngine(),
                    upgradeMagento(),
                    magentoTask(
                        `cache:disable block_html layout${
                            !varnish.enabled ? ' full_page' : ''
                        }`
                    )
                ],
                {
                    concurrent: false,
                    exitOnError: true,
                    ctx,
                    rendererOptions: {
                        collapse: false
                    }
                }
            )
        }

        const { code, result } = await runMagentoCommand(
            ctx,
            'setup:db:status',
            {
                throwNonZeroCode: false
            }
        )

        switch (code) {
            case 0: {
                ctx.isSetupUpgradeNeeded = false
                // no setup is needed, but still to be sure configure ES
                return task.newListr(
                    [
                        checkSearchEngineVersion(),
                        varnishConfigSetup(),
                        configureSearchEngine()
                    ],
                    {
                        concurrent: false,
                        exitOnError: true,
                        ctx,
                        rendererOptions: {
                            collapse: false
                        }
                    }
                )
            }
            case 1: {
                if (options.onlyInstallMagento) {
                    ctx.isSetupUpgradeNeeded = false
                    return task.newListr([
                        checkSearchEngineVersion(),
                        installMagentoProject(),
                        installMagento()
                    ])
                }

                return task.newListr(
                    [
                        checkSearchEngineVersion(),
                        installMagentoProject(),
                        installMagento(),
                        updateEnvPHP(),
                        varnishConfigSetup(),
                        configureSearchEngine(),
                        upgradeMagento(),
                        magentoTask(
                            `cache:disable block_html layout${
                                !varnish.enabled ? ' full_page' : ''
                            }`
                        )
                    ],
                    {
                        concurrent: false,
                        exitOnError: true,
                        ctx,
                        rendererOptions: {
                            collapse: false
                        }
                    }
                )
            }
            case 2: {
                return task.newListr(
                    [
                        checkSearchEngineVersion(),
                        varnishConfigSetup(),
                        configureSearchEngine(),
                        upgradeMagento()
                    ],
                    {
                        concurrent: false,
                        exitOnError: true,
                        ctx,
                        rendererOptions: {
                            collapse: false
                        }
                    }
                )
            }
            default: {
                throw new UnknownError(
                    `Migrating database failed: manual action is required!\n\n${result}`
                )
            }
        }
    },
    options: {
        bottomBar: 10
    }
})

module.exports = migrateDatabase
