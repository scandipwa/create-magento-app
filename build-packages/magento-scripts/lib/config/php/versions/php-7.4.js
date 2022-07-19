const path = require('path');
const { image } = require('../base-image');
const xdebug = require('../extensions/xdebug');

const php74 = ({
    templateDir,
    extensions = {},
    baseImage = image,
    tag = 'php74'
} = {}) => ({
    baseImage,
    tag,
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions: {
        xdebug,
        ...extensions
    }
});

module.exports = php74;
