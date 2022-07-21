const path = require('path');
const { image } = require('../base-image');
const xdebug = require('../extensions/xdebug');

/**
 * @returns {import('../../../../typings/index').PHPConfiguration}
 */
const php72 = ({
    templateDir,
    extensions = {},
    baseImage = `${ image }:php72`
} = {}) => ({
    baseImage,
    debugImage: `${ baseImage }.debug`,
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions: {
        xdebug,
        ...extensions
    }
});

module.exports = php72;
