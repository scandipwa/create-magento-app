/**
 * @returns {import('../../../../../typings/index').MariaDBConfiguration}
 */
const mariadb118 = () => ({
    image: 'mariadb:11.8',
    useOptimizerSwitch: true,
    binFileName: 'mariadb',
    binAdminFileName: 'mariadb-admin'
})

module.exports = mariadb118
