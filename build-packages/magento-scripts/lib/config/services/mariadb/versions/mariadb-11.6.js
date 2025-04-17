/**
 * @returns {import('../../../../../typings/index').MariaDBConfiguration}
 */
const mariadb116 = () => ({
    image: 'mariadb:11.6',
    useOptimizerSwitch: true,
    binFileName: 'mariadb',
    binAdminFileName: 'mariadb-admin'
})

module.exports = mariadb116
