/* eslint-disable max-len */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const KnownError = require('../../errors/known-error');
const UnknownError = require('../../errors/unknown-error');
const { execAsyncSpawn, execCommandTask } = require('../../util/exec-async-command');
const pathExists = require('../../util/path-exists');
const connectToMySQL = require('./connect-to-mysql');

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
const deleteDatabaseBeforeImportingDumpPrompt = () => ({
    title: 'Deleting magento database before importing dump',
    task: async (ctx, task) => {
        const deleteDatabaseMagentoChoice = await task.prompt({
            type: 'Select',
            message: `Before importing database dump, would you like to delete existing database?

It is possible that dump might interfere with existing data in database.

Note that you will lose your existing database!`,
            choices: [
                {
                    name: 'delete',
                    message: 'YES I AM SURE I WANT TO DELETE magento DATABASE!'
                },
                {
                    name: 'skip',
                    message: 'Skip this step'
                }
            ]
        });

        if (deleteDatabaseMagentoChoice === 'delete') {
            await ctx.mysqlConnection.query('DROP DATABASE IF EXISTS magento;');
            await ctx.mysqlConnection.query('CREATE DATABASE magento;');
            return;
        }
        task.skip();
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
            if (e.message.includes('Unknown collation: \'utf8mb4_0900_ai_ci\'')) {
                const confirmFixingCollation = await task.prompt({
                    type: 'Select',
                    message: `We got the following error while trying to import ${logger.style.file('dump.sql')}!

${e.message}

To fix this error we suggest running the following commands:
${logger.style.command('sed -i \'s/utf8mb4_0900_ai_ci/utf8mb4_general_ci/g\' dump.sql')}
`,
                    choices: [
                        {
                            name: 'yes',
                            message: 'Yes, run the following commands, I reaaaalllyy want dump to work! (this will not edit original dump.sql)'
                        },
                        {
                            name: 'no',
                            message: 'Okay, I got it. Will try to fix myself'
                        }
                    ]
                });

                if (confirmFixingCollation === 'yes') {
                    task.output = 'Running fix command...';
                    await execAsyncSpawn(`docker exec ${mysql.name} bash -c "sed -i 's/utf8mb4_0900_ai_ci/utf8mb4_general_ci/g' dump.sql"`);

                    task.output = 'Trying to import dump again...';
                    try {
                        await execAsyncSpawn(
                            importCommand,
                            {
                                callback: (t) => {
                                    task.output = t;
                                }
                            }
                        );

                        return;
                    } catch (e) {
                        throw new KnownError(`Fixing ${logger.style.file('dump.sql')} collations did not helped, we got the following error:
${e.message}`);
                    }
                } else {
                    throw new KnownError(`Database dump import unsuccessful!

${e.message}

You can try replacing all occurrences of ${logger.style.misc('utf8mb4_0900_ai_ci')} with ${logger.style.misc('utf8mb4_general_ci')} in your ${logger.style.file(ctx.importDb)} file!`);
                }
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
            deleteDatabaseBeforeImportingDumpPrompt(),
            runSetGlobalLogBinTrustFunctionCreatorsCommand(),
            executeImportDumpSQL(),
            connectToMySQL(),
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
