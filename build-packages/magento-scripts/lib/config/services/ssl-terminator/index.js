const path = require('path')

/**
 * @param {{ templateDir: string }} param0
 * @returns {import('../../../../typings/index').NginxConfiguration}
 */
const sslTerminator = ({ templateDir }) => ({
    image: 'nginx:1.18.0',
    configTemplate: path.join(templateDir || '', 'ssl-terminator.template.conf')
})

module.exports = {
    sslTerminator
}
