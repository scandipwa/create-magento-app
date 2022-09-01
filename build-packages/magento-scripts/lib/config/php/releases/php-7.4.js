const path = require('path');
const { xdebug } = require('../extensions');

const php74 = ({ templateDir, additionalExtensions = {} } = {}) => ({
    version: '7.4.30',
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    extensions: {
        gd: {},
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

module.exports = php74;
