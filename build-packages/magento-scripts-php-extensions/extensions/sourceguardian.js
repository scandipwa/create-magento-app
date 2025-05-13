const path = require('path')

const archivesByArch = {
    x64: 'https://www.sourceguardian.com/loaders/download/loaders.linux-x86_64.tar.gz',
    arm64: 'https://www.sourceguardian.com/loaders/download/loaders.macosx-arm64.tar.gz'
}

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
const sourceguardianExtensionCommand = async ({ ctx }) => {
    const phpExtensionsDirectory = '/usr/sourceguardian'
    const phpVersionMatch = ctx.phpVersion.match(/^(\d)\.(\d)/i)

    if (phpVersionMatch) {
        const phpMajorVersion = phpVersionMatch[1]
        const phpMinorVersion = phpVersionMatch[2]
        const fileName = `ixed.${phpMajorVersion}.${phpMinorVersion}.lin`;
        const extensionPath = path.join(
            phpExtensionsDirectory,
            fileName
        );

        return `mkdir /usr/sourceguardian; \
curl ${getDownloadLink(ctx.arch)} --output sourceguardian-loaders.tar.gz; \
tar -zxf ./sourceguardian-loaders.tar.gz --directory /usr/sourceguardian/ ${fileName}; \
echo 'extension=${extensionPath}' | tee /usr/local/etc/php/conf.d/00-sourceguardian.ini`
    }

    throw new Error('cannot parse php version from context!')
}

/** @type {import('@scandipwa/magento-scripts').PHPExtensionInstallationInstruction} */
const sourceguardianExtension = {
    name: 'sourceguardian',
    alternativeName: ['SourceGuardian'],
    command: sourceguardianExtensionCommand,
    dependencies: ['eudev-dev'] // libudev.so
}

module.exports = sourceguardianExtension
