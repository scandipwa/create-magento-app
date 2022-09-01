const path = require('path');
const { xdebug } = require('../extensions');

const php73 = ({ templateDir, additionalExtensions = {} }) => ({
    version: '7.3.33',
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

module.exports = php73;
