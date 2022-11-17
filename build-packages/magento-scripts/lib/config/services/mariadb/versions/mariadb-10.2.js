/**
 * @returns {import('../../../../../typings/index').MariaDBConfiguration}
 */
const mariadb102 = () => ({
    image: 'mariadb:10.2',
    useOptimizerSwitch: false
})

module.exports = mariadb102
