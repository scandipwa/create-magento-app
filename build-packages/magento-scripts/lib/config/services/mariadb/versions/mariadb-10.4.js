/**
 * @returns {import('../../../../../typings/index').MariaDBConfiguration}
 */
const mariadb104 = () => ({
    image: 'mariadb:10.4',
    useOptimizerSwitch: true,
    binFileName: 'mysql',
    binAdminFileName: 'mysqladmin'
})

module.exports = mariadb104
