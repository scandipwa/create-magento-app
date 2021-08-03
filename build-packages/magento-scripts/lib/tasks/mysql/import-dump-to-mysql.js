/* eslint-disable max-len,no-param-reassign */
const { execAsyncSpawn } = require('../../util/exec-async-command');
const pathExists = require('../../util/path-exists');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const importDumpToMySQL = {
    title: 'Importing Database Dump To MySQL',
    task: async (ctx, task) => {
        if (!await pathExists(ctx.importDb)) {
            throw new Error(`Dump file at ${ctx.importDb} does not exist. Please provide correct relative path to the file`);
        }

        const { config: { docker }, ports } = ctx;

        const { mysql } = docker.getContainers(ports);

        const startImportTime = Date.now();
        const tickInterval = setInterval(() => {
            task.title = `Importing Database Dump To MySQL, ${Math.floor((Date.now() - startImportTime) / 1000)}s in progress...`;
        }, 1000);

        try {
            await execAsyncSpawn(
                `docker cp ${ctx.importDb} ${mysql.name}:/dump.sql`
            );

            await execAsyncSpawn(
                `docker exec ${mysql.name} bash -c 'mysql -uroot -p${mysql.env.MYSQL_ROOT_PASSWORD} -e "SET GLOBAL log_bin_trust_function_creators = 1;"'`
            );

            await execAsyncSpawn(
                `docker exec ${mysql.name} bash -c "mysqlimport -umagento -pmagento magento ./dump.sql"`,
                {
                    callback: (t) => {
                        task.output = t;
                    }
                }
            );
        } catch (e) {
            throw new Error(`Unexpected error during dump import.\n\n${e}`);
        }

        clearInterval(tickInterval);

        task.title = 'Database imported!';
    },
    options: {
        bottomBar: 10
    }
};

module.exports = importDumpToMySQL;
