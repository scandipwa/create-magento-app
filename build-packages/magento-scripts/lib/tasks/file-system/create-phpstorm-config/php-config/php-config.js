const path = require('path')
const { baseConfig } = require('../../../../config')

/**
 * @param {import('../../../../../typings/context').ListrContext} ctx
 */
const getPhpConfig = (ctx) => {
    const [majorPHPVersion, minorPHPVersion] = ctx.phpVersion.split('.')
    const phpLanguageLevel = `${majorPHPVersion}.${minorPHPVersion}`

    return {
        phpLanguageLevel,
        path: path.join(process.cwd(), '.idea', 'php.xml'),
        templatePath: path.join(baseConfig.templateDir, 'php.template.xml')
    }
}

module.exports = {
    getPhpConfig
}
