const path = require('path')

const archivesByArch = require('./lib/config')

/**
 * @param {import('@scandipwa/magento-scripts/typings/context').ListrContext['arch']} arch
 * @returns link to archive by arch
 */
const getDownloadLink = (arch) => {
    switch (arch) {
        case 'x64':
        case 'arm64': {
            return archivesByArch[arch]
        }
        default: {
            throw new Error(`Architecture ${process.arch} is not supported`)
        }
    }
}

/** @type {import('@scandipwa/magento-scripts').PHPExtensionInstallationInstruction['command']} */
const ioncubeExtensionCommand = async ({ ctx }) => {
    const downloadLink = getDownloadLink(ctx.arch)
    const phpExtensionsDirectory = '/usr/ioncube'
    const phpVersionMatch = ctx.phpVersion.match(/^(\d)\.(\d)/i)

    if (phpVersionMatch && phpVersionMatch.length > 1) {
        const [_, phpMajorVersion, phpMinorVersion] = phpVersionMatch
        return `curl ${downloadLink} --output ioncube_loaders_lin_x86-64.tar.gz; \
tar -zxf ./${path.basename(downloadLink)} --directory /usr/; \
{ \
    echo 'zend_extension=${path.join(
        phpExtensionsDirectory,
        `ioncube_loader_lin_${phpMajorVersion}.${phpMinorVersion}.so`
    )}'; \
} | tee /usr/local/etc/php/conf.d/00-ioncube.ini`
    }

    throw new Error('cannot parse php version from context!')
}

/** @type {import('@scandipwa/magento-scripts').PHPExtensionInstallationInstruction} */
const ioncubeExtension = {
    name: 'ioncube',
    alternativeName: ['ionCube Loader'],
    command: ioncubeExtensionCommand
}

module.exports = ioncubeExtension
