/**
 * @returns {import('../../../../../typings/index').MariaDBConfiguration}
 */
const mariadb104 = () => ({
    image: 'mariadb:10.4',
    useOptimizerSwitch: true
})

module.exports = mariadb104
