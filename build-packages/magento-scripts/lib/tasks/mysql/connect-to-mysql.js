const mysql = require('mysql2/promise');
const UnknownError = require('../../errors/unknown-error');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const sleep = require('../../util/sleep');
const { createMagentoDatabase } = require('./create-magento-database');

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const waitForMySQLInitialization = () => ({
    title: 'Waiting for MySQL to initialize',
    task: async (ctx, task) => {
        const { mysql: { name } } = ctx.config.docker.getContainers();
        let mysqlReadyForConnections = false;
        while (!mysqlReadyForConnections) {
            const mysqlOutput = await execAsyncSpawn(`docker logs ${name}`);
            if (mysqlOutput.includes('ready for connections')) {
                mysqlReadyForConnections = true;
                break;
            } else if (mysqlOutput.includes('Initializing database files')) {
                task.output = `MySQL is initializing database files!
Please wait, this will take some time and do not restart the MySQL container until initialization is finished!`;

                let mysqlFinishedInitialization = false;
                while (!mysqlFinishedInitialization) {
                    const mysqlOutput = await execAsyncSpawn(`docker logs ${name}`);
                    if (mysqlOutput.includes('init process done.') && !mysqlFinishedInitialization) {
                        mysqlFinishedInitialization = true;
                        break;
                    }
                    await sleep(2000);
                }
            }

            await sleep(2000);
        }
    },
    options: {
        bottomBar: 10
    }
});

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const gettingMySQLConnection = () => ({
    title: 'Getting MySQL connection',
    task: async (ctx, task) => {
        const { config: { docker }, ports } = ctx;
        const { mysql: { env } } = docker.getContainers();
        let tries = 0;
        const maxTries = 20;
        const errors = [];
        while (tries < maxTries) {
            tries++;
            try {
                const connection = await mysql.createConnection({
                    host: '127.0.0.1',
                    port: ports.mysql,
                    user: env.MYSQL_USER,
                    password: env.MYSQL_PASSWORD,
                    database: env.MYSQL_DATABASE
                });

                ctx.mysqlConnection = connection;
                break;
            } catch (e) {
                errors.push(e);
            }
            await sleep(1000);
        }

        if (tries === maxTries) {
            throw new UnknownError(`Unable to connect to MySQL server. Check your server configuration!\n\n${ errors.join(' ') }`);
        }

        task.title = 'MySQL server connected!';
    }
});

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const connectToMySQL = () => ({
    title: 'Connecting to MySQL server',
    skip: (ctx) => ctx.skipSetup,
    task: (ctx, task) => task.newListr([
        waitForMySQLInitialization(),
        createMagentoDatabase(),
        gettingMySQLConnection()
    ], {
        concurrent: false,
        rendererOptions: {
            collapse: true
        }
    }),
    options: {
        bottomBar: 10
    }
});

module.exports = connectToMySQL;
