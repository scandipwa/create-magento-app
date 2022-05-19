const path = require('path');

const sslTerminator = ({ templateDir }) => ({
    version: '1.18.0',
    configTemplate: path.join(templateDir || '', 'ssl-terminator.template.conf')
});

module.exports = {
    sslTerminator
};
