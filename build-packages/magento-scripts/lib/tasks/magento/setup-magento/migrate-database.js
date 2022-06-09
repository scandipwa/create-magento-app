const path = require('path');
const installMagentoProject = require('../install-magento-project');
const magentoTask = require('../../../util/magento-task');
const runMagentoCommand = require('../../../util/run-magento');
const configureElasticsearch = require('./configure-elasticsearch');
const installMagento = require('./install-magento');
const upgradeMagento = require('./upgrade-magento');
const varnishConfigSetup = require('./varnish-config');
const pathExists = require('../../../util/path-exists');

/**
 * @param {Object} [options]
 * @param {Boolean} options.onlyInstallMagento
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const migrateDatabase = (options = {}) => ({
    title: 'Migrating database',
    task: async (ctx, task) => {
        const {
            magentoVersion,
            mysqlConnection
        } = ctx;

        const [[{ tableCount }]] = await mysqlConnection.query(`
            SELECT count(*) AS tableCount
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'magento';
        `);

        if (tableCount === 0) {
            if (options.onlyInstallMagento) {
                ctx.isSetupUpgradeNeeded = false;
                return task.newListr(
                    installMagento({ isDbEmpty: true })
                );
            }

            return task.newListr([
                installMagento({ isDbEmpty: true }),
                varnishConfigSetup(),
                configureElasticsearch(),
                upgradeMagento(),
                magentoTask('cache:enable')
            ], {
                concurrent: false,
                exitOnError: true,
                ctx,
                rendererOptions: {
                    collapse: false
                }
            });
        }
        if (!await pathExists(path.join(process.cwd(), 'app', 'etc', 'config.php'))) {
            return task.newListr([
                installMagento(),
                varnishConfigSetup(),
                configureElasticsearch(),
                upgradeMagento(),
                magentoTask('cache:enable')
            ]);
        }
        const { code } = await runMagentoCommand('setup:db:status', {
            magentoVersion,
            throwNonZeroCode: false
        });

        switch (code) {
        case 0: {
            ctx.isSetupUpgradeNeeded = false;
            // no setup is needed, but still to be sure configure ES
            return task.newListr([
                varnishConfigSetup(),
                configureElasticsearch()
            ], {
                concurrent: false,
                exitOnError: true,
                ctx,
                rendererOptions: {
                    collapse: false
                }
            });
        }
        case 1: {
            if (options.onlyInstallMagento) {
                ctx.isSetupUpgradeNeeded = false;
                return task.newListr(
                    installMagentoProject()
                );
            }

            return task.newListr([
                installMagentoProject(),
                varnishConfigSetup(),
                configureElasticsearch(),
                upgradeMagento(),
                magentoTask('cache:enable')
            ], {
                concurrent: false,
                exitOnError: true,
                ctx,
                rendererOptions: {
                    collapse: false
                }
            });
        }
        case 2: {
            return task.newListr([
                varnishConfigSetup(),
                configureElasticsearch(),
                upgradeMagento()
            ], {
                concurrent: false,
                exitOnError: true,
                ctx,
                rendererOptions: {
                    collapse: false
                }
            });
        }
        default: {
        // TODO: handle these statuses ?
            task.title = 'Migrating database failed: manual action is required!';
            break;
        }
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = migrateDatabase;
