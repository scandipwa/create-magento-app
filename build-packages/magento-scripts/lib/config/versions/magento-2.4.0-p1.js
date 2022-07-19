const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');
const { magento24PHPExtensionList } = require('../magento/required-php-extensions');
const { php74 } = require('../php/versions');
const { sslTerminator } = require('../ssl-terminator');
const { varnish60 } = require('../varnish/varnish-6-0');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.4.0-p1',
    configuration: {
        php: php74({
            templateDir,
            extensions: magento24PHPExtensionList,
            tag: 'magento240p1'
        }),
        nginx: {
            version: '1.18.0',
            configTemplate: path.join(templateDir || '', 'nginx.template.conf')
        },
        redis: {
            version: '5'
        },
        mysql: {
            version: '8.0'
        },
        mariadb: {
            version: '10.2'
        },
        elasticsearch: {
            version: '7.6.2'
        },
        composer: {
            version: '1'
        },
        varnish: varnish60({ templateDir }),
        sslTerminator: sslTerminator({ templateDir })
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
