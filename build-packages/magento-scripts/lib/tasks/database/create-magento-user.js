const mysql2 = require('mysql2/promise')
const sleep = require('../../util/sleep')
const defaultMagentoUser = require('./default-magento-user')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createMagentoUser = () => ({
    title: 'Creating Magento user',
    task: async (ctx, task) => {
        const { mariadb } = ctx.config.docker.getContainers()

        /** @type {import('mysql2/promise').Connection | undefined} */
        let connection
        const maxTries = 20

        for (let tries = 1; tries <= maxTries; tries++) {
            try {
                connection = await mysql2.createConnection({
                    host: '127.0.0.1',
                    port: ctx.ports.mariadb,
                    user: 'root',
                    password: mariadb.env.MARIADB_ROOT_PASSWORD
                })
                break
            } catch (e) {
                if (tries === maxTries) {
                    throw e
                }
                await sleep(1000)
            }
        }

        if (!connection) {
            throw new Error('Failed to connect to MariaDB')
        }

        const result = await connection.query(
            'select Host, User from mysql.user;'
        )

        if (result.length === 0) {
            task.skip()
            return
        }

        const [users] = result

        if (
            users.some(
                (user) =>
                    user.User === defaultMagentoUser.user && user.Host === '%'
            )
        ) {
            task.skip()
            return
        }

        if (users.some((user) => user.User === defaultMagentoUser.user)) {
            const magentoUser = users.find(
                (user) => user.User === defaultMagentoUser.user
            )

            await connection.query(
                `DROP USER '${magentoUser.User}'@'${magentoUser.Host}'`
            )
        }

        await connection.query(
            `CREATE USER '${defaultMagentoUser.user}'@'${defaultMagentoUser.host}' IDENTIFIED BY '${defaultMagentoUser.password}';`
        )
        await connection.query(
            `GRANT ALL PRIVILEGES ON *.* TO '${defaultMagentoUser.user}'@'${defaultMagentoUser.host}' WITH GRANT OPTION;`
        )
        await connection.query('FLUSH PRIVILEGES;')

        await connection.destroy()
    }
})

module.exports = {
    createMagentoUser
}
