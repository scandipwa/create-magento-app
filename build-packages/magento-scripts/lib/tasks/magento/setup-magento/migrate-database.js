/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
// const runComposerCommand = require('../../../util/run-composer');
const runMagentoCommand = require('../../../util/run-magento');
const installMagento = require('./install-magento');

const migrateDatabase = {
    title: 'Migrating database',
    task: async (ctx, task) => {
        const { magentoVersion, mysqlConnection: connection } = ctx;

        const [[{ tableCount }]] = await connection.query(`
            SELECT count (*) AS tableCount
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'magento';
        `);

        if (tableCount === 0) {
            task.output = 'No Magento is installed in DB!\nInstalling...';

            return task.newListr([
                installMagento
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
            // No upgrade/install is needed
            task.skip();
            break;
        }
        case 1: {
            return task.newListr([
                installMagento
            ], {
                concurrent: false,
                exitOnError: true,
                ctx
            });
        }
        case 2: {
            task.output = 'Upgrading magento';
            await runMagentoCommand('setup:upgrade', {
                magentoVersion,
                callback: (t) => {
                    task.output = t;
                }
            });
            task.title = 'Migrating database: upgraded!';
            break;
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
};

module.exports = migrateDatabase;
