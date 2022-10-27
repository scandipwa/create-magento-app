const path = require('path')
const { repo } = require('../base-repo')
const xdebug = require('../extensions/xdebug')

/**
 * @param {Object} param0
 * @param {string} param0.templateDir
 * @param {import('../../../../../typings/index').PHPExtensions} [param0.extensions]
 * @param {string} [param0.baseImage]
 * @returns {import('../../../../../typings/index').PHPConfiguration}
 */
const php81 = ({
    templateDir,
    extensions = {},
    baseImage = `${repo}:php-8.1`
}) => ({
    baseImage,
    debugImage: `${baseImage}-debug`,
    configTemplate: path.join(templateDir || '', 'php.template.ini'),
    fpmConfigTemplate: path.join(templateDir || '', 'php-fpm.template.conf'),
    debugTemplate: path.join(templateDir || '', 'php-debug.template.ini'),
    extensions: {
        xdebug,
        ...extensions
    }
})

module.exports = php81