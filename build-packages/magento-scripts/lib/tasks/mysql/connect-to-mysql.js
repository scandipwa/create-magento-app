/* eslint-disable no-await-in-loop,no-param-reassign */
const mysql = require('mysql2/promise');
const sleep = require('../../util/sleep');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const connectToMySQL = {
    title: 'Connecting to MySQL server',
    task: async (ctx, task) => {
        task.title = 'Connecting to MySQL server...';
        const { config: { docker }, ports } = ctx;
        const { mysql: { env } } = docker.getContainers();
        let tries = 0;
        while (tries < 10) {
            tries++;
            try {
                const connection = await mysql.createConnection({
                    host: 'localhost',
                    port: ports.mysql,
                    user: env.MYSQL_USER,
                    password: env.MYSQL_PASSWORD,
                    database: env.MYSQL_DATABASE
                });

                ctx.mysqlConnection = connection;
                break;
            } catch (e) {
                //
            }
            await sleep(5000);
        }
        if (tries === 10) {
            throw new Error('Unable to connect to MySQL server. Check your server configuration!');
        }

        task.title = `MySQL server connected${tries > 2 ? ` after ${tries} tries.` : '!'}`;
    },
    options: {
        bottomBar: 10
    }
};

module.exports = connectToMySQL;
