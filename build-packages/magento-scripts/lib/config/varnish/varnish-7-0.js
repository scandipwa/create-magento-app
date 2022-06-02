const path = require('path');

const varnish70 = ({ templateDir }) => ({
    enabled: true,
    version: '7.0',
    configTemplate: path.join(templateDir || '', 'varnish.template.vcl')
});

module.exports = {
    varnish70
};
