const defaultEnv = require('../default-es-env');

/**
 * @returns {import('../../../../../typings/index').ServiceWithImage}
 */
const elasticsearch712 = () => ({
    image: 'elasticsearch:7.12.1',
    env: defaultEnv
});

module.exports = elasticsearch712;
