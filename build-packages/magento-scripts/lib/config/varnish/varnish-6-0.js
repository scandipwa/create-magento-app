const path = require('path');

const varnish60 = ({ templateDir }) => ({
    enabled: true,
    version: '6.0',
    configTemplate: path.join(templateDir || '', 'varnish.template.vcl')
});

module.exports = {
    varnish60
};
