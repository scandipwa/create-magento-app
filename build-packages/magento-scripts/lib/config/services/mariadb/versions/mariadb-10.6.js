/**
 * @returns {import('../../../../../typings/index').MariaDBConfiguration}
 */
const mariadb106 = () => ({
    image: 'mariadb:10.6',
    useOptimizerSwitch: true,
    binFileName: 'mysql',
    binAdminFileName: 'mysqladmin'
})

module.exports = mariadb106
