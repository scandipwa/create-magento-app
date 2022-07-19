const path = require('path');
const { image } = require('../base-image');
const xdebug = require('../extensions/xdebug');

const php81 = ({
    templateDir,
    extensions = {},
    baseImage = image,
    tag = 'php81'
} = {}) => ({
    baseImage,
    tag,
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions: {
        xdebug,
        ...extensions
    }
});

module.exports = php81;
