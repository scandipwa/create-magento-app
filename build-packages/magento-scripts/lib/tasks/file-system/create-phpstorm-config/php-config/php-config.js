const path = require('path');
const { baseConfig } = require('../../../../config');

/**
 * @param {import('../../../../../typings/index').CMAConfiguration} app
 */
const getPhpConfig = (app) => {
    const [majorPHPVersion, minorPHPVersion] = app.configuration.php.version.split('.');
    const phpLanguageLevel = `${ majorPHPVersion }.${ minorPHPVersion }`;

    return {
        phpLanguageLevel,
        path: path.join(process.cwd(), '.idea', 'php.xml'),
        templatePath: path.join(baseConfig.templateDir, 'php.template.xml')
    };
};

module.exports = {
    getPhpConfig
};
