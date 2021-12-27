const path = require('path');
const os = require('os');
const fs = require('fs');

const ioncubeConfig = require('./lib/config');
const downloadFile = require('./lib/util/download-file');
const pathExists = require('./lib/util/path-exists');
const execAsync = require('./lib/util/exec-async');

const downloadsPath = path.join(os.homedir(), 'Downloads');

/** @param {import('@scandipwa/magento-scripts/typings/context').ListrContext['config']} param0 */
const getExtensionsDirectory = ({ php }) => path.join(
    process.env.PHPBREW_HOME || path.join(os.homedir(), '.phpbrew'),
    'php',
    `php-${php.version}`,
    'lib',
    'php',
    'extensions'
);

/** @param {import('@scandipwa/magento-scripts/typings/context').ListrContext['config']} param0 */
const getIoncubeIniPath = ({ php }) => path.join(
    process.env.PHPBREW_HOME || path.join(os.homedir(), '.phpbrew'),
    'php',
    `php-${php.version}`,
    'var',
    'db',
    'ioncube.ini'
);

const getDownloadLink = () => {
    switch (process.platform) {
    case 'linux': {
        switch (process.arch) {
        case 'x64':
        case 'amd64': {
            return ioncubeConfig.links[process.platform][process.arch];
        }
        default: {
            throw new Error(`Architecture ${process.arch} is not supported`);
        }
        }
    }
    // ioncube for macos has only x64 version
    case 'darwin': {
        return ioncubeConfig.links[process.platform].x64;
    }
    default: {
        throw new Error(`Platform ${process.platform} is not supported!`);
    }
    }
};

const platformPrefix = () => {
    switch (process.platform) {
    case 'linux': {
        return 'lin';
    }
    case 'darwin': {
        return 'mac';
    }
    default: {
        throw new Error(`Platform ${process.platform} is not supported`);
    }
    }
};

/** @type {import('@scandipwa/magento-scripts').PHPExtension['install']} */
const ioncubeExtensionInstall = async (ctx, task) => {
    const downloadLink = getDownloadLink();

    const downloadDestination = path.join(downloadsPath, path.parse(downloadLink).base);

    if (!await pathExists(downloadDestination)) {
        task.output = `Downloading extension into ${downloadDestination} folder...`;
        await downloadFile(
            downloadLink,
            downloadDestination
        );
    }

    const phpExtensionsDirectory = getExtensionsDirectory(ctx.config);

    task.output = `Extracting archive to ${phpExtensionsDirectory}...`;
    if (!await pathExists(path.join(phpExtensionsDirectory, 'ioncube'))) {
        await execAsync(`tar -zxf ${downloadDestination} --directory ${phpExtensionsDirectory}`);
    } else {
        await fs.promises.rm(path.join(phpExtensionsDirectory, 'ioncube'), {
            recursive: true
        });
        await execAsync(`tar -zxf ${downloadDestination} --directory ${phpExtensionsDirectory}`);
    }

    const ioncubeIniFilePath = getIoncubeIniPath(ctx.config);
    // eslint-disable-next-line no-unused-vars
    const [_, phpMajorVersion, phpMinorVersion] = ctx.config.php.version.match(/^(\d)\.(\d)/i);
    const ioncubeIniFileContent = `zend_extension=${path.join(
        phpExtensionsDirectory,
        'ioncube',
        `ioncube_loader_${platformPrefix()}_${phpMajorVersion}.${phpMinorVersion}.so`
    )}\n`;

    task.output = `Creating ioncube configuration file in ${ioncubeIniFilePath}...`;
    await fs.promises.writeFile(ioncubeIniFilePath, ioncubeIniFileContent, {
        encoding: 'utf-8'
    });
};

// /** @type {import('@scandipwa/magento-scripts').PHPExtension['disable']} */
// const ioncubeExtensionDisable = async (ctx, task) => {};

// /** @type {import('@scandipwa/magento-scripts').PHPExtension['enable']} */
// const ioncubeExtensionEnable = async (ctx, task) => {};

/** @type {import('@scandipwa/magento-scripts').PHPExtension} */
const ioncubeExtension = {
    extensionName: 'ionCube Loader',
    install: ioncubeExtensionInstall
    // disable: ioncubeExtensionDisable,
    // enable: ioncubeExtensionEnable
};

module.exports = ioncubeExtension;
