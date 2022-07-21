const path = require('path');
const { image } = require('../base-image');
const xdebug = require('../extensions/xdebug');

/**
 * @returns {import('../../../../typings/index').PHPConfiguration}
 */
const php74 = ({
    templateDir,
    extensions = {},
    baseImage = `${ image }:php74`
} = {}) => ({
    baseImage,
    debugImage: `${ baseImage }.debug`,
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions: {
        xdebug,
        ...extensions
    }
});

module.exports = php74;
