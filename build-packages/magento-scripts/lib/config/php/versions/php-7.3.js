const path = require('path');
const { baseImage } = require('../base-image');
const xdebug = require('../../magento/instructions-for-php-extensions/xdebug');

const php73 = ({ templateDir, extensions = {} }) => ({
    baseImage,
    tag: 'php73',
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions: {
        xdebug,
        ...extensions
    }
});

module.exports = php73;
