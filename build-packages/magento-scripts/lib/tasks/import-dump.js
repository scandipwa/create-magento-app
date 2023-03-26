const path = require('path')
const { checkRequirements } = require('./requirements')
const {
    importDumpToDatabase,
    fixDB,
    dumpThemeConfig,
    restoreThemeConfig
} = require('./database')
const { setupMagento } = require('./magento')
const indexProducts = require('./magento/setup-magento/index-products')
const {
    retrieveProjectConfiguration,
    stopProject,
    retrieveFreshProjectConfiguration,
    configureProject
} = require('./start')
const importRemoteDb = require('./database/import-remote-db')
const matchFilesystem = require('../util/match-filesystem')

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const importDump = () => ({
    title: 'Importing Database Dump',
    task: (ctx, task) =>
        task.newListr(
            [
                importRemoteDb(),
                checkRequirements(),
                retrieveProjectConfiguration(),
                stopProject(),
                retrieveFreshProjectConfiguration(),
                configureProject(),
                {
                    title: 'Installing Magento',
                    // skip setup if env.php and config.php are present in app/etc folder and db is not empty
                    skip: async (ctx) => {
                        const isFsMatching = await matchFilesystem(
                            path.join(process.cwd(), 'app', 'etc'),
                            ['config.php', 'env.php']
                        )
                        const { databaseConnection } = ctx
                        const [[{ tableCount }]] =
                            await databaseConnection.query(`
                    SELECT count(*) AS tableCount
                    FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_SCHEMA = 'magento';
                `)

                        return tableCount !== 0 || !isFsMatching
                    },
                    task: async (subCtx, subTask) => {
                        const doYouWantToRunSetupOnEmptyDB =
                            await subTask.prompt({
                                type: 'Select',
                                message: `We detected that Magento is not installed in database. Do you want to install Magento in database BEFORE importing database dump?`,
                                choices: [
                                    {
                                        name: 'try-install',
                                        message:
                                            'Try installing Magento before importing database'
                                    },
                                    {
                                        name: 'skip',
                                        message:
                                            'Skip installing Magento and import database dump right away!'
                                    }
                                ]
                            })

                        if (doYouWantToRunSetupOnEmptyDB === 'skip') {
                            subTask.skip()
                            return
                        }

                        return subTask.newListr(
                            setupMagento({ onlyInstallMagento: true })
                        )
                    }
                },
                dumpThemeConfig(),
                importDumpToDatabase(),
                restoreThemeConfig(),
                fixDB(),
                setupMagento(),
                indexProducts()
            ],
            {
                concurrent: false,
                exitOnError: true,
                rendererOptions: {
                    collapse: false
                }
            }
        )
})

module.exports = importDump
