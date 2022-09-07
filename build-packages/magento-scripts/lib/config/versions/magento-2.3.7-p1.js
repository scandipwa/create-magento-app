const { defaultMagentoConfig } = require('../magento-config');
const { magento23PHPExtensionList } = require('../magento/required-php-extensions');
const { repo } = require('../php/base-repo');
const { php74 } = require('../php/versions');
const { composer2 } = require('../services/composer/versions');
const { nginx118 } = require('../services/nginx/versions');
const { sslTerminator } = require('../services/ssl-terminator');
const { varnish66 } = require('../varnish/varnish-6-6');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.3.7-p1',
    configuration: {
        php: php74({
            templateDir,
            extensions: magento23PHPExtensionList,
            baseImage: `${ repo }:php-7.4-magento-2.3`
        }),
        nginx: nginx118({ templateDir }),
        redis: {
            version: '6'
        },
        mysql: {
            version: '5.7'
        },
        mariadb: {
            version: '10.2'
        },
        elasticsearch: {
            version: '7.9.3'
        },
        composer: composer2(),
        varnish: varnish66({ templateDir }),
        sslTerminator: sslTerminator({ templateDir })
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
