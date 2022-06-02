const path = require('path');
const fs = require('fs');
const os = require('os');
const pathExists = require('../../../util/path-exists');
const UnknownError = require('../../../errors/unknown-error');

/**
 * @type {import('../../../../typings/index').PHPExtension}
 */
module.exports = {
    extensionName: 'sodium',
    hooks: {
        postInstall: async ({ php }) => {
            const sodiumDynamicLibraryPath = path.join(
                os.homedir(),
                '.phpbrew',
                'php',
                `php-${php.version}`,
                'var',
                'db',
                'libsodium.ini'
            );

            if (!await pathExists(sodiumDynamicLibraryPath)) {
                throw new UnknownError(`libsodium dynamic library file configuration not found: ${sodiumDynamicLibraryPath}`);
            }
            const fileContent = await fs.promises.readFile(sodiumDynamicLibraryPath, 'utf-8');

            if (/^extension=libsodium\.so$/.test(fileContent.trim())) {
                await fs.promises.writeFile(
                    sodiumDynamicLibraryPath,
                    'extension=sodium.so\n',
                    'utf-8'
                );
            }
        }
    }
};
