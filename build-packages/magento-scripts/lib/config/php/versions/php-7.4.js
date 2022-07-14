const path = require('path');
const { baseImage } = require('../base-image');

const php74 = ({ templateDir, extensions = {} } = {}) => ({
    baseImage,
    tag: 'php-7.4',
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions
});

module.exports = php74;
