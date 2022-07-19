const path = require('path');
const { image } = require('../base-image');
const xdebug = require('../extensions/xdebug');

const php73 = ({
    templateDir, extensions = {},
    baseImage = image,
    tag = 'php73'
}) => ({
    baseImage,
    tag,
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions: {
        xdebug,
        ...extensions
    }
});

module.exports = php73;
