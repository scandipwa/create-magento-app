/* eslint-disable max-len */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const KnownError = require('../../errors/known-error');
const UnknownError = require('../../errors/unknown-error');
const { execAsyncSpawn, execCommandTask } = require('../../util/exec-async-command');
const pathExists = require('../../util/path-exists');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const copyDatabaseDumpIntoContainer = () => ({
    title: 'Copying database dump into container',
    task: async (ctx, task) => {
        const { config: { docker }, ports } = ctx;
        const { mysql } = docker.getContainers(ports);

        return task.newListr(
            execCommandTask(`docker cp ${ctx.importDb} ${mysql.name}:/dump.sql`, {
                logOutput: true
            })
        );
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const runSetGlobalLogBinTrustFunctionCreatorsCommand = () => ({
    task: async (ctx, task) => {
        const { config: { docker }, ports } = ctx;
        const { mysql } = docker.getContainers(ports);

        return task.newListr(
            execCommandTask(`docker exec ${mysql.name} bash -c 'mysql -uroot -p${mysql.env.MYSQL_ROOT_PASSWORD} -e "SET GLOBAL log_bin_trust_function_creators = 1;"'`)
        );
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const executeImportDumpSQL = () => ({
    task: async (ctx, task) => {
        const { config: { docker }, ports } = ctx;
        const { mysql } = docker.getContainers(ports);

        const userCredentialsForMySQLCLI = await task.prompt({
            type: 'Select',
            message: 'Which user do you want to use to import db in MySQL client?',
            choices: [
                {
                    name: `--user=root --password=${mysql.env.MYSQL_ROOT_PASSWORD}`,
                    message: `root (${logger.style.command('Probably safest option')})`
                },
                {
                    name: `--user=${mysql.env.MYSQL_USER} --password=${mysql.env.MYSQL_PASSWORD}`,
                    message: `${mysql.env.MYSQL_USER}`
                }
            ]
        });

        const importCommand = `docker exec ${mysql.name} bash -c "mysql ${userCredentialsForMySQLCLI} magento < ./dump.sql"`;

        const startImportTime = Date.now();
        const tickInterval = setInterval(() => {
            task.title = `Importing Database Dump To MySQL, ${Math.floor((Date.now() - startImportTime) / 1000)}s in progress...`;
        }, 1000);

        try {
            await execAsyncSpawn(
                importCommand,
                {
                    callback: (t) => {
                        task.output = t;
                    }
                }
            );
        } catch (e) {
            if (e.includes('Unknown collation: \'utf8mb4_0900_ai_ci\'')) {
                throw new KnownError(`Error happened during database dump import!

${e}

You can try replacing all occurrences of ${logger.style.misc('utf8mb4_0900_ai_ci')} with ${logger.style.misc('utf8mb4_general_ci')} in your ${logger.style.file(ctx.importDb)} file!`);
            }

            throw new UnknownError(`Unexpected error during dump import.\n\n${e}`);
        } finally {
            clearInterval(tickInterval);
        }
    },
    options: {
        bottomBar: 10
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const importDumpToMySQL = () => ({
    title: 'Importing Database Dump To MySQL',
    task: async (ctx, task) => {
        if (!await pathExists(ctx.importDb)) {
            throw new KnownError(`Dump file at ${ctx.importDb} does not exist. Please provide correct relative path to the file`);
        }

        return task.newListr([
            copyDatabaseDumpIntoContainer(),
            runSetGlobalLogBinTrustFunctionCreatorsCommand(),
            executeImportDumpSQL(),
            {
                task: () => {
                    task.title = 'Database imported!';
                }
            }
        ], {
            rendererOptions: {
                collapse: false
            }
        });
    }
});

module.exports = importDumpToMySQL;
