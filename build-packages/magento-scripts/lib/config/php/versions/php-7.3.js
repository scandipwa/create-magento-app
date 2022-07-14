const path = require('path');
const { baseImage } = require('../base-image');

const php73 = ({ templateDir, extensions = {} }) => ({
    baseImage,
    tag: 'php-7.3',
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions
});

module.exports = php73;
