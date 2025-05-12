/**
 * @returns {import('../../../../../typings/index').MariaDBConfiguration}
 */
const mariadb102 = () => ({
    image: 'mariadb:10.2',
    useOptimizerSwitch: false,
    binFileName: 'mysql',
    binAdminFileName: 'mysqladmin'
})

module.exports = mariadb102
