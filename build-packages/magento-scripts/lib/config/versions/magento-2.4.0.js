const {
    magento24PHPExtensionList
} = require('../magento/required-php-extensions')
const { repo } = require('../services/php/base-repo')
const { php74 } = require('../services/php/versions')
const { composer1 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { nginx118 } = require('../services/nginx/versions')
const { redis50 } = require('../services/redis')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish60 } = require('../services/varnish')
const { mariadb102 } = require('../services/mariadb/versions')
const { elasticsearch712 } = require('../services/elasticsearch/versions')
const { mysql80 } = require('../services/mysql/versions')
const { opensearch12 } = require('../services/opensearch/versions')

/**
 * @type {import('../../../typings/common').MagentoVersionConfigurationFunction}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.4.0',
    configuration: {
        php: php74({
            templateDir,
            extensions: magento24PHPExtensionList,
            baseImage: `${repo}:php-7.4-magento-2.4`
        }),
        nginx: nginx118({ templateDir }),
        redis: redis50(),
        mysql: mysql80(),
        mariadb: mariadb102(),
        elasticsearch: elasticsearch712(),
        composer: composer1(),
        varnish: varnish60({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev(),
        opensearch: opensearch12()
    }
})
