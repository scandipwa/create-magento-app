const { defaultMagentoConfig } = require('../magento-config')
const sodium = require('../services/php/extensions/sodium')
const {
    magento24PHPExtensionList
} = require('../magento/required-php-extensions')
const { php81 } = require('../services/php/versions')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish71 } = require('../services/varnish')
const { repo } = require('../services/php/base-repo')
const { nginx118 } = require('../services/nginx/versions')
const { composer2 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { redis70 } = require('../services/redis')
const { mariadb104 } = require('../services/mariadb/versions')
const { elasticsearch84 } = require('../services/elasticsearch/versions')
const { mysql80 } = require('../services/mysql/versions')

/**
 * @param {Object} param0
 * @param {string} param0.templateDir
 * @returns {import('../../../typings/index').CMAConfiguration & { magentoVersion: string, isDefault?: boolean }}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.4.6',
    isDefault: true,
    configuration: {
        php: php81({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${repo}:php-8.1-magento-2.4`
        }),
        nginx: nginx118({ templateDir }),
        redis: redis70(),
        mysql: mysql80(),
        mariadb: mariadb104(),
        elasticsearch: elasticsearch84(),
        composer: composer2(),
        varnish: varnish71({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev()
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
})
