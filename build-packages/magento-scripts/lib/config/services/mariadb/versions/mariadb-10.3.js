/**
 * @returns {import('../../../../../typings/index').MariaDBConfiguration}
 */
const mariadb103 = () => ({
    image: 'mariadb:10.3',
    useOptimizerSwitch: false,
    binFileName: 'mysql',
    binAdminFileName: 'mysqladmin'
})

module.exports = mariadb103
