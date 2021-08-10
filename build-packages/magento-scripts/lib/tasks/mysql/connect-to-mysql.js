const mysql = require('mysql2/promise');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const sleep = require('../../util/sleep');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const connectToMySQL = () => ({
    title: 'Connecting to MySQL server...',
    task: async (ctx, task) => {
        const { config: { docker }, ports } = ctx;
        const { mysql: { env, name } } = docker.getContainers();
        let tries = 0;
        let maxTries = 20;
        const errors = [];
        while (tries < maxTries) {
            tries++;

            if (maxTries !== 120) {
                const mysqlOutput = await execAsyncSpawn(`docker logs ${name}`);
                if (mysqlOutput.includes('Initializing database files')) {
                    maxTries = 120;
                    task.output = `MySQL is initializing database files!
Please wait, this will take some time and do not restart the MySQL container until initialization is finished!`;
                }
                await sleep(2000);
            }
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
                errors.push(e);
            }
            await sleep(1000);
        }

        if (tries === maxTries) {
            throw new Error(`Unable to connect to MySQL server. Check your server configuration!\n\n${ errors.join(' ') }`);
        }

        task.title = 'MySQL server connected!';
    },
    options: {
        bottomBar: 10
    }
});

module.exports = connectToMySQL;
