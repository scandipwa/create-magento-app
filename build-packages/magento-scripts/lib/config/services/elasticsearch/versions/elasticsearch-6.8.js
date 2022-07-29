const { repo } = require('../base-repo');

/**
 * @returns {import('../../../../../typings/index').ServiceWithImage}
 */
const elasticsearch68 = ({
    image = `${ repo }:elasticsearch-6.8`
} = {}) => ({
    image
});

module.exports = elasticsearch68;
