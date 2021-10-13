const path = require('path');

module.exports = () => {
    const phpStormConfiguration = {
        xdebug: {
            path: path.join(process.cwd(), '.idea', 'workspace.xml'),
            templatePath: path.join(__dirname, 'templates', 'workspace.template.xml')
        }
    };

    return phpStormConfiguration;
};
