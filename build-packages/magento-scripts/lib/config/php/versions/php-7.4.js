const path = require('path');
const { baseImage } = require('../base-image');
const xdebug = require('../../magento/instructions-for-php-extensions/xdebug');

const php74 = ({ templateDir, extensions = {} } = {}) => ({
    baseImage,
    tag: 'php74',
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions: {
        xdebug,
        ...extensions
    }
});

module.exports = php74;
