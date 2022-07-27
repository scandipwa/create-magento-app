const mysql2 = require('mysql2/promise');
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
        const { mysql } = ctx.config.docker.getContainers();

        task.title = `Waiting for ${mysql._} to initialize`;

        let mysqlReadyForConnections = false;

        while (!mysqlReadyForConnections) {
            const mysqlOutput = await execAsyncSpawn(`docker logs ${mysql.name}`);
            if (mysqlOutput.includes('ready for connections')) {
                mysqlReadyForConnections = true;
                break;
            } else if (mysqlOutput.includes('Initializing database files')) {
                task.output = `MySQL is initializing database files!
Please wait, this will take some time and do not restart the MySQL container until initialization is finished!`;

                let mysqlFinishedInitialization = false;
                while (!mysqlFinishedInitialization) {
                    const mysqlOutput = await execAsyncSpawn(`docker logs ${mysql.name}`);
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
        const { mysql } = docker.getContainers(ctx.ports);
        let tries = 0;
        const maxTries = 20;
        const errors = [];

        task.title = `Getting ${mysql._} connection`;

        while (tries < maxTries) {
            tries++;
            try {
                const connection = await mysql2.createConnection({
                    host: '127.0.0.1',
                    port: ports.mysql,
                    user: mysql.env.MYSQL_USER,
                    password: mysql.env.MYSQL_PASSWORD,
                    database: mysql.env.MYSQL_DATABASE
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
const terminatingExistingConnection = () => ({
    title: 'Terminating existing Database connection',
    skip: (ctx) => !ctx.mysqlConnection,
    task: (ctx) => {
        ctx.mysqlConnection.destroy();
    }
});

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const connectToMySQL = () => ({
    title: 'Connecting to MySQL server',
    skip: (ctx) => ctx.skipSetup,
    task: (ctx, task) => {
        const { mysql } = ctx.config.docker.getContainers();

        task.title = `Connecting to ${mysql._} server`;

        return task.newListr([
            waitForMySQLInitialization(),
            createMagentoDatabase(),
            terminatingExistingConnection(),
            gettingMySQLConnection()
        ], {
            concurrent: false,
            rendererOptions: {
                collapse: true
            }
        });
    },
    options: {
        bottomBar: 10
    }
});

module.exports = connectToMySQL;
