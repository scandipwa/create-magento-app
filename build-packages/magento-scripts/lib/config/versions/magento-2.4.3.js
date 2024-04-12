const sodium = require('../services/php/extensions/sodium')
const {
    magento24PHPExtensionList
} = require('../magento/required-php-extensions')
const { php74 } = require('../services/php/versions')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish66 } = require('../services/varnish')
const { repo } = require('../services/php/base-repo')
const { nginx118 } = require('../services/nginx/versions')
const { composer2 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { redis60 } = require('../services/redis')
const { mariadb104 } = require('../services/mariadb/versions')
const { elasticsearch710 } = require('../services/elasticsearch/versions')
const { mysql80 } = require('../services/mysql/versions')
const { opensearch12 } = require('../services/opensearch/versions')

/**
 * @type {import('../../../typings/common').MagentoVersionConfigurationFunction}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.4.3',
    configuration: {
        php: php74({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${repo}:php-7.4-magento-2.4`
        }),
        nginx: nginx118({ templateDir }),
        redis: redis60(),
        mysql: mysql80(),
        mariadb: mariadb104(),
        elasticsearch: elasticsearch710(),
        composer: composer2(),
        varnish: varnish66({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev(),
        opensearch: opensearch12()
    }
})
