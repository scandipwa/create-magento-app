const magentoTask = require('../../../util/magento-task');
const runMagentoCommand = require('../../../util/run-magento');
const adjustMagentoConfiguration = require('./adjust-magento-configuration');
const configureElasticsearch = require('./configure-elasticsearch');
const installMagento = require('./install-magento');
const upgradeMagento = require('./upgrade-magento');
const setupPersistedQuery = require('../../theme/setup-persisted-query');

/**
 * @type {({ onlyInstallMagento: boolean }) => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const migrateDatabase = (options = {}) => ({
    title: 'Migrating database',
    task: async (ctx, task) => {
        const {
            magentoVersion,
            mysqlConnection
        } = ctx;

        const [[{ tableCount }]] = await mysqlConnection.query(`
            SELECT count (*) AS tableCount
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'magento';
        `);

        if (tableCount === 0) {
            task.output = 'No Magento is installed in DB!\nInstalling...';

            if (options.onlyInstallMagento) {
                return task.newListr(
                    installMagento()
                );
            }

            return task.newListr([
                installMagento(),
                setupPersistedQuery(),
                upgradeMagento(),
                magentoTask('cache:enable'),
                configureElasticsearch()
            ], {
                concurrent: false,
                exitOnError: true,
                ctx
            });
        }
        const { code } = await runMagentoCommand('setup:db:status', {
            magentoVersion,
            throwNonZeroCode: false
        });

        switch (code) {
        case 0: {
            // no setup is needed, but still to be sure configure ES
            return task.newListr([
                setupPersistedQuery(),
                configureElasticsearch()
            ], {
                concurrent: false,
                exitOnError: true,
                ctx
            });
        }
        case 1: {
            if (options.onlyInstallMagento) {
                return task.newListr(
                    installMagento()
                );
            }

            return task.newListr([
                installMagento(),
                setupPersistedQuery(),
                upgradeMagento(),
                magentoTask('cache:enable'),
                configureElasticsearch()
            ], {
                concurrent: false,
                exitOnError: true,
                ctx
            });
        }
        case 2: {
            return task.newListr([
                setupPersistedQuery(),
                adjustMagentoConfiguration(),
                configureElasticsearch(),
                upgradeMagento()
            ], {
                concurrent: false,
                exitOnError: true,
                ctx
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
