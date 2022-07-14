const path = require('path');
const { baseImage } = require('../base-image');

const php81 = ({ templateDir, extensions = {} } = {}) => ({
    baseImage,
    tag: 'php-8.1',
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions
});

module.exports = php81;
