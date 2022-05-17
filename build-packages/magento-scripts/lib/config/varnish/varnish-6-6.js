const path = require('path');

const varnish66 = ({ templateDir }) => ({
    enabled: true,
    version: '6.6',
    configTemplate: path.join(templateDir || '', 'varnish.template.vcl')
});

module.exports = {
    varnish66
};
