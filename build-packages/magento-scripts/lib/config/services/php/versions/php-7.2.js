const path = require('path')
const { repo } = require('../base-repo')
const xdebug = require('../extensions/xdebug')

/**
 * @returns {import('../../../../typings/index').PHPConfiguration}
 */
const php72 = ({
    templateDir,
    extensions = {},
    baseImage = `${repo}:php-7.2`
} = {}) => ({
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

module.exports = php72
