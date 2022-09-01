const path = require('path');
const { libsodium, xdebug } = require('../extensions');

const php81 = ({ templateDir, additionalExtensions = {} } = {}) => ({
    version: '8.1.7',
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions: {
        gd: {},
        zlib: {},
        openssl: {},
        sockets: {},
        SimpleXML: {},
        libsodium,
        fileinfo: {},
        xdebug,
        apcu: {},
        opcache: {
            extensionName: 'Zend OPcache'
        },
        ...additionalExtensions
    }
});

module.exports = php81;
