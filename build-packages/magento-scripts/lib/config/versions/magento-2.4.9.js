const sodium = require('../services/php/extensions/sodium')
const ftp = require('../services/php/extensions/ftp')
const {
    magento24PHPExtensionList
} = require('../magento/required-php-extensions')
const { php83 } = require('../services/php/versions')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish80 } = require('../services/varnish')
const { repo } = require('../services/php/base-repo')
const { nginx128 } = require('../services/nginx/versions')
const { composer29 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { valkey90 } = require('../services/redis')
const { mariadb118 } = require('../services/mariadb/versions')
const { elasticsearch817 } = require('../services/elasticsearch/versions')
const { mysql84 } = require('../services/mysql/versions')
const { opensearch300 } = require('../services/opensearch/versions')

/**
 * @type {import('../../../typings/common').MagentoVersionConfigurationFunction}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.4.9',
    isDefault: true,
    configuration: {
        php: php83({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium, ftp },
            baseImage: `${repo}:php-8.5-magento-2.4`
        }),
        nginx: nginx128({ templateDir }),
        redis: valkey90(),
        mysql: mysql84(),
        mariadb: mariadb118(),
        // not supported
        elasticsearch: elasticsearch817(),
        composer: composer29(),
        varnish: varnish80({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev(),
        opensearch: opensearch300(),
        searchengine: 'opensearch'
    }
})
