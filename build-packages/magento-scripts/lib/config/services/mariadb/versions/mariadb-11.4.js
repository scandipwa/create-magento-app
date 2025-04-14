/**
 * @returns {import('../../../../../typings/index').MariaDBConfiguration}
 */
const mariadb114 = () => ({
    image: 'mariadb:11.4',
    useOptimizerSwitch: true
})

module.exports = mariadb114
