const { elasticsearch68 } = require('../services/elasticsearch/versions')
const {
    magento23PHPExtensionList
} = require('../magento/required-php-extensions')
const { repo } = require('../services/php/base-repo')
const { php72 } = require('../services/php/versions')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish66 } = require('../services/varnish')
const { nginx118 } = require('../services/nginx/versions')
const { composer1 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { redis50 } = require('../services/redis')
const { mariadb102 } = require('../services/mariadb/versions')
const { mysql57 } = require('../services/mysql/versions')
const { opensearch12 } = require('../services/opensearch/versions')

/**
 * @type {import('../../../typings/common').MagentoVersionConfigurationFunction}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.3.2-p1',
    configuration: {
        php: php72({
            templateDir,
            extensions: magento23PHPExtensionList,
            baseImage: `${repo}:php-7.2-magento-2.3`
        }),
        nginx: nginx118({ templateDir }),
        redis: redis50(),
        mysql: mysql57(),
        mariadb: mariadb102(),
        elasticsearch: elasticsearch68(),
        composer: composer1(),
        varnish: varnish66({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev(),
        opensearch: opensearch12()
    }
})
