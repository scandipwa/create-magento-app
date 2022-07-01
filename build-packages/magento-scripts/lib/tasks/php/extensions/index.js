/* eslint-disable max-len */
const path = require('path');
const fs = require('fs');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const pathExists = require('../../../util/path-exists');
const phpbrewConfig = require('../../../config/phpbrew');

/**
 * Get enabled extensions list with versions
 * @param {import('../../../../typings/context').ListrContext['config']} param0
 * @returns {Promise<{[key: string]: string}}>}
 */
const getEnabledExtensions = async ({ php }) => {
    const output = await execAsyncSpawn(
        `${ php.binPath } -c ${php.iniPath} -r 'foreach (get_loaded_extensions() as $extension) echo "$extension:" . phpversion($extension) . "\n";'`,
        { useRosetta2: true }
    );

    return output
        .split('\n')
        .map((m) => {
            // eslint-disable-next-line no-unused-vars
            const [_, moduleName, moduleVersion] = m.match(/(.+):(.+)/i);

            return [moduleName, moduleVersion];
        })
        .reduce((acc, [name, version]) => ({ ...acc, [name]: version }), {});
};

/**
 * Get disabled extensions list
 * @param {import('../../../../typings/context').ListrContext['config']} param0
 * @returns {Promise<string[]>}
 */
const getDisabledExtensions = async ({ php }) => {
    const extensionsIniDirectory = path.join(phpbrewConfig.phpPath, `php-${php.version}`, 'var', 'db');

    if (!await pathExists(extensionsIniDirectory)) {
        return [];
    }

    const extensionIniList = await fs.promises.readdir(
        extensionsIniDirectory,
        {
            encoding: 'utf-8',
            withFileTypes: true
        }
    );

    return extensionIniList.filter((f) => f.isFile() && f.name.endsWith('.disabled')).map((f) => f.name.replace('.ini.disabled', ''));
};

/**
 * Get installed extensions
 * @param {import('../../../../typings/context').ListrContext['config']} param0
 * @returns {Promise<string[]>}
 */
const getInstalledExtensions = async ({ php }) => {
    const extensionDirectory = path.join(phpbrewConfig.buildPath, `php-${php.version}`, 'ext');

    const availableExtensions = await fs.promises.readdir(extensionDirectory, {
        encoding: 'utf-8'
    });

    return availableExtensions;
};

module.exports = {
    getEnabledExtensions,
    getDisabledExtensions,
    getInstalledExtensions
};
