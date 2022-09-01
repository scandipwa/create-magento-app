const path = require('path');
const { xdebug } = require('../extensions');

const php72 = ({ templateDir, additionalExtensions = {} }) => ({
    version: '7.2.34',
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions: {
        gd: {
            macosOptions: '--with-zlib-dir=$(brew --prefix zlib) --with-freetype-dir=$(brew --prefix freetype)'
        },
        zlib: {},
        openssl: {},
        sockets: {},
        SimpleXML: {},
        xdebug,
        apcu: {},
        opcache: {
            extensionName: 'Zend OPcache'
        },
        ...additionalExtensions
    }
});

module.exports = php72;
