/**
 * @returns {import('../../../../../typings/index').MariaDBConfiguration}
 */
const mariadb114 = () => ({
    image: 'mariadb:11.4',
    useOptimizerSwitch: true,
    binFileName: 'mariadb',
    binAdminFileName: 'mariadb-admin'
})

module.exports = mariadb114
