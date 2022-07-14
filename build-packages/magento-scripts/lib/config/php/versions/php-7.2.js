const path = require('path');
const { baseImage } = require('../base-image');

const php72 = ({ templateDir }) => ({
    baseImage,
    tag: 'php-7.2',
    configTemplate: path.join(templateDir || '', 'php.template.ini')
});

module.exports = php72;
